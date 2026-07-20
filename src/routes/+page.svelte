<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { resolve } from '$app/paths';
	import {
		ArrowRight,
		Briefcase,
		Camera,
		Check,
		CircleAlert,
		Lightbulb,
		RefreshCw,
		ScanFace,
		ShieldCheck,
		Presentation,
		Upload,
		UserRound,
		Users,
		X
	} from '@lucide/svelte';
	import {
		analysisResultSchema,
		MAX_SOURCE_IMAGE_BYTES,
		SUPPORTED_IMAGE_TYPES,
		type AnalysisResult
	} from '$lib/domains/analysis/shared/contracts';
	import { prepareImageForUpload } from '$lib/domains/analysis/client/image';
	import { isLocale, messages, type Locale } from '$lib/i18n/messages';
	import type { CameraQuality } from '$lib/domains/camera/shared/contracts';
	import { inspectFrame } from '$lib/domains/camera/client/quality';
	import {
		clearBeforeCapture,
		readBeforeCapture,
		saveBeforeCapture,
		type StoredCapture
	} from '$lib/domains/comparison/client/storage';
	import LanguageButton from '$lib/components/LanguageButton.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	type Stage = 'landing' | 'camera' | 'review' | 'analyzing' | 'result' | 'comparison';
	type Scenario = 'interview' | 'meeting' | 'presentation' | 'profile';
	const scenarios: Scenario[] = ['interview', 'meeting', 'presentation', 'profile'];

	let stage = $state<Stage>('landing');
	let locale = $state<Locale>('en');
	let scenario = $state<Scenario>('interview');
	let video = $state<HTMLVideoElement>();
	let fileInput: HTMLInputElement;
	let stream = $state<MediaStream | null>(null);
	let captureFile = $state<File | null>(null);
	let captureUrl = $state('');
	let result = $state<AnalysisResult | null>(null);
	let previousCapture = $state<StoredCapture | null>(null);
	let comparisonPosition = $state(50);
	let isRetake = $state(false);
	let cameraError = $state('');
	let analysisError = $state('');
	let uploadError = $state('');
	let isPreparingImage = $state(false);
	let preparedImage = $state<{
		originalBytes: number;
		preparedBytes: number;
		wasOptimized: boolean;
	} | null>(null);
	let stageHeading = $state<HTMLHeadingElement>();
	let analysisController: AbortController | null = null;
	let qualityCheckInFlight = false;
	let quality = $state<CameraQuality>({
		face: 'unknown',
		position: 'unknown',
		lighting: 'unknown',
		background: 'unknown',
		brightness: 0.58,
		messageKey: 'preparing'
	});
	let qualityTimer: ReturnType<typeof setInterval> | undefined;
	const copy = $derived(messages[locale]);
	const scenarioCopy = $derived(copy.scenarios[scenario]);
	const preparedImageNote = $derived.by(() => {
		if (!preparedImage) return '';
		const preparedSize = formatFileSize(preparedImage.preparedBytes);
		return preparedImage.wasOptimized
			? copy.review.optimized(formatFileSize(preparedImage.originalBytes), preparedSize)
			: copy.review.prepared(preparedSize);
	});

	const stepNumber = $derived(
		stage === 'camera' || stage === 'review'
			? 1
			: stage === 'analyzing'
				? 2
				: stage === 'result' || stage === 'comparison'
					? 3
					: 0
	);
	const readinessScore = $derived(
		Math.round(
			(quality.face === 'good' ? 28 : quality.face === 'warning' ? 10 : 16) +
				(quality.position === 'good' ? 28 : quality.position === 'warning' ? 10 : 15) +
				(quality.lighting === 'good' ? 24 : quality.lighting === 'warning' ? 8 : 13) +
				(quality.background === 'good' ? 20 : quality.background === 'warning' ? 7 : 11)
		)
	);
	const expectedGain = $derived(
		result
			? Math.min(
					15,
					Math.max(
						4,
						Math.round(
							result.guidance.reduce((total, item) => total + item.expectedImpact, 0) * 0.55
						)
					)
				)
			: 0
	);
	const projectedScore = $derived(result ? Math.min(96, result.overallScore + expectedGain) : 0);
	const comparisonGain = $derived(
		result && previousCapture
			? Math.max(0, result.overallScore - previousCapture.result.overallScore)
			: 0
	);
	const localizedSummary = $derived(
		!result
			? ''
			: result.overallScore >= 75
				? scenarioCopy.summaryReady
				: scenarioCopy.summaryImprove
	);
	const localizedMetrics = $derived(
		result
			? result.metrics.map((item) => ({
					...item,
					label:
						copy.report.metricLabels[item.key as keyof typeof copy.report.metricLabels] ??
						item.label
				}))
			: []
	);
	const localizedGuidance = $derived(
		result
			? result.guidance.map((item) => {
					const localized = copy.report.guidance[item.id as keyof typeof copy.report.guidance];
					return {
						...item,
						title: localized?.title ?? item.title,
						description: localized?.description ?? item.description
					};
				})
			: []
	);
	const appearanceInsights = $derived.by(() => {
		if (!result) return [];
		const score = (key: string, fallback: number) =>
			result?.metrics.find((metric) => metric.key === key)?.score ?? fallback;
		const conditionScore = Math.round((score('texture', 70) + score('pore', 75)) / 2);
		const toneScore = score('redness', 74);
		const balanceScore = Math.round((score('dark_circle', 66) + result.overallScore) / 2);
		const lightingScore = score('radiance', 72);
		return [
			{
				key: 'condition',
				label: copy.report.appearance.condition.label,
				score: conditionScore,
				summary:
					conditionScore >= 75
						? copy.report.appearance.condition.good
						: copy.report.appearance.condition.attention,
				insight: copy.report.appearance.condition.insight
			},
			{
				key: 'tone',
				label: copy.report.appearance.tone.label,
				score: toneScore,
				summary: `${copy.report.skinTone.undertone} ${copy.report.undertone}`,
				insight: copy.report.appearance.tone.insight
			},
			{
				key: 'balance',
				label: copy.report.appearance.balance.label,
				score: balanceScore,
				summary:
					balanceScore >= 75
						? copy.report.appearance.balance.good
						: copy.report.appearance.balance.attention,
				insight: copy.report.appearance.balance.insight
			},
			{
				key: 'lighting',
				label: copy.report.appearance.lighting.label,
				score: lightingScore,
				summary:
					lightingScore >= 75
						? copy.report.appearance.lighting.good
						: copy.report.appearance.lighting.attention,
				insight: copy.report.appearance.lighting.insight
			}
		];
	});

	onMount(() => {
		const savedLocale = localStorage.getItem('presence-locale');
		if (isLocale(savedLocale)) locale = savedLocale;
		const savedScenario = localStorage.getItem('presence-scenario');
		if (isScenario(savedScenario)) scenario = savedScenario;
		document.documentElement.lang = locale;
		previousCapture = readBeforeCapture();
		return () => stopCamera();
	});

	function setLocale(nextLocale: Locale) {
		locale = nextLocale;
		localStorage.setItem('presence-locale', nextLocale);
		document.documentElement.lang = nextLocale;
	}

	function isScenario(value: string | null): value is Scenario {
		return scenarios.includes(value as Scenario);
	}

	function setScenario(nextScenario: Scenario) {
		scenario = nextScenario;
		localStorage.setItem('presence-scenario', nextScenario);
	}

	async function changeStage(nextStage: Stage) {
		stage = nextStage;
		await tick();
		stageHeading?.focus({ preventScroll: true });
		window.scrollTo({ top: 0 });
	}

	async function startExperience(retake = false) {
		isRetake = retake;
		analysisError = '';
		uploadError = '';
		captureFile = null;
		captureUrl = '';
		preparedImage = null;
		await changeStage('camera');
		await startCamera();
	}

	async function startCamera() {
		stopCamera();
		cameraError = '';
		if (!video) return;
		const cameraVideo = video;
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'user',
					width: { ideal: 1920, min: 640 },
					height: { ideal: 1080, min: 480 }
				},
				audio: false
			});
			cameraVideo.srcObject = stream;
			await cameraVideo.play();
			qualityTimer = setInterval(async () => {
				if (cameraVideo.readyState < 2 || qualityCheckInFlight) return;
				qualityCheckInFlight = true;
				try {
					quality = await inspectFrame(cameraVideo);
				} finally {
					qualityCheckInFlight = false;
				}
			}, 650);
		} catch (error) {
			cameraError =
				error instanceof DOMException && error.name === 'NotAllowedError'
					? copy.camera.errors.permission
					: copy.camera.errors.unavailable;
		}
	}

	function stopCamera() {
		if (qualityTimer) clearInterval(qualityTimer);
		qualityTimer = undefined;
		qualityCheckInFlight = false;
		stream?.getTracks().forEach((track) => track.stop());
		stream = null;
	}

	function drawCover(
		context: CanvasRenderingContext2D,
		source: CanvasImageSource,
		sourceWidth: number,
		sourceHeight: number,
		width: number,
		height: number
	) {
		const sourceRatio = sourceWidth / sourceHeight;
		const targetRatio = width / height;
		let sx = 0;
		let sy = 0;
		let sw = sourceWidth;
		let sh = sourceHeight;
		if (sourceRatio > targetRatio) {
			sw = sourceHeight * targetRatio;
			sx = (sourceWidth - sw) / 2;
		} else {
			sh = sourceWidth / targetRatio;
			sy = (sourceHeight - sh) / 2;
		}
		context.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
	}

	async function capturePhoto() {
		if (!video?.videoWidth) return;
		const canvas = document.createElement('canvas');
		canvas.width = 1080;
		canvas.height = 1350;
		const context = canvas.getContext('2d');
		if (!context) return;
		context.translate(canvas.width, 0);
		context.scale(-1, 1);
		drawCover(context, video, video.videoWidth, video.videoHeight, canvas.width, canvas.height);
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', 0.9)
		);
		if (!blob) return;
		const file = new File([blob], `presence-${Date.now()}.jpg`, { type: 'image/jpeg' });
		captureFile = file;
		captureUrl = await readFile(file);
		preparedImage = {
			originalBytes: file.size,
			preparedBytes: file.size,
			wasOptimized: false
		};
		stopCamera();
		await changeStage('review');
	}

	async function selectFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploadError = '';
		if (
			!SUPPORTED_IMAGE_TYPES.includes(file.type as (typeof SUPPORTED_IMAGE_TYPES)[number]) ||
			file.size > MAX_SOURCE_IMAGE_BYTES
		) {
			uploadError = copy.camera.errors.file;
			input.value = '';
			return;
		}

		isPreparingImage = true;
		try {
			const prepared = await prepareImageForUpload(file);
			captureFile = prepared.file;
			captureUrl = await readFile(prepared.file);
			preparedImage = {
				originalBytes: prepared.originalBytes,
				preparedBytes: prepared.file.size,
				wasOptimized: prepared.wasOptimized
			};
			quality = { ...quality, brightness: await measureBrightness(captureUrl) };
			cameraError = '';
			stopCamera();
			await changeStage('review');
		} catch {
			uploadError = copy.camera.errors.preparation;
		} finally {
			isPreparingImage = false;
			input.value = '';
		}
	}

	function openFilePicker() {
		uploadError = '';
		fileInput.click();
	}

	function formatFileSize(bytes: number) {
		const megabyte = 1024 * 1024;
		const useMegabytes = bytes >= megabyte;
		return new Intl.NumberFormat(locale, {
			style: 'unit',
			unit: useMegabytes ? 'megabyte' : 'kilobyte',
			unitDisplay: 'short',
			maximumFractionDigits: 1
		}).format(useMegabytes ? bytes / megabyte : bytes / 1024);
	}

	function readFile(file: File) {
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}

	function loadImage(src: string) {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = reject;
			image.src = src;
		});
	}

	async function measureBrightness(src: string) {
		const image = await loadImage(src);
		const canvas = document.createElement('canvas');
		canvas.width = 80;
		canvas.height = 80;
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) return 0.58;
		context.drawImage(image, 0, 0, 80, 80);
		const data = context.getImageData(0, 0, 80, 80).data;
		let total = 0;
		for (let index = 0; index < data.length; index += 16) {
			total += 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
		}
		return total / (data.length / 16) / 255;
	}

	async function retake() {
		captureFile = null;
		captureUrl = '';
		preparedImage = null;
		await startExperience(isRetake);
	}

	async function analyze() {
		if (!captureFile) return;
		analysisError = '';
		analysisController?.abort();
		const controller = new AbortController();
		analysisController = controller;
		await changeStage('analyzing');
		const form = new FormData();
		form.set('image', captureFile);
		form.set('brightness', String(quality.brightness));
		form.set('locale', locale);
		form.set('scenario', scenario);

		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				body: form,
				signal: controller.signal
			});
			const body = await response.json();
			if (!response.ok) throw new Error(body.message ?? copy.review.errors.generic);
			result = analysisResultSchema.parse(body);
			if (isRetake && previousCapture) {
				await changeStage('comparison');
			} else {
				await changeStage('result');
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') return;
			analysisError = error instanceof Error ? error.message : copy.review.errors.interrupted;
			await changeStage('review');
		} finally {
			if (analysisController === controller) analysisController = null;
		}
	}

	async function cancelAnalysis() {
		analysisController?.abort();
		analysisController = null;
		analysisError = '';
		await changeStage('review');
	}

	function improve() {
		if (!result || !captureUrl) return;
		previousCapture = { image: captureUrl, result };
		saveBeforeCapture(previousCapture);
		void startExperience(true);
	}

	async function startOver() {
		if (stage !== 'landing' && !window.confirm(copy.common.startOverConfirm)) return;
		analysisController?.abort();
		analysisController = null;
		stopCamera();
		clearBeforeCapture();
		previousCapture = null;
		captureFile = null;
		captureUrl = '';
		preparedImage = null;
		result = null;
		isRetake = false;
		comparisonPosition = 50;
		await changeStage('landing');
	}

	function qualityLabel(value: CameraQuality['face']) {
		return copy.camera.labels[value];
	}
</script>

<svelte:head>
	<title>{copy.meta.title}</title>
	<meta name="description" content={copy.meta.description} />
</svelte:head>

<a class="skip-link" href="#main-content">{copy.header.skip}</a>

<header class="site-header" class:compact={stage !== 'landing'}>
	<button type="button" class="brand" aria-label={copy.header.home} onclick={startOver}>
		<img
			class="brand-lockup"
			src="/presence-logo-assets/presence-lockup.svg"
			alt=""
			width="191"
			height="40"
		/>
		<img
			class="brand-symbol"
			src="/presence-logo-assets/presence-mark.svg"
			alt=""
			width="48"
			height="56"
		/>
	</button>
	<div class="header-actions">
		{#if stage === 'landing'}
			<a class="privacy-note" href={resolve('/privacy')}>
				<ShieldCheck size={16} /><span>{copy.header.privacy}</span>
			</a>
		{:else}
			<ol class="steps" aria-label={copy.header.progress}>
				{#each [1, 2, 3] as step (step)}
					<li
						class:active={step <= stepNumber}
						aria-current={step === stepNumber ? 'step' : undefined}
					>
						<span aria-hidden="true">{step < stepNumber ? '✓' : step}</span>
						<span class="visually-hidden">
							{copy.header.stepLabels[step - 1]}{#if step === stepNumber}
								&nbsp;· {copy.header.currentStep}
							{:else if step < stepNumber}
								&nbsp;· {copy.header.completedStep}
							{/if}
						</span>
					</li>
					{#if step < 3}<i aria-hidden="true" class:active={step < stepNumber}></i>{/if}
				{/each}
			</ol>
		{/if}
		<LanguageButton {locale} ariaLabel={copy.header.language} onLocaleChange={setLocale} />
	</div>
</header>

<main id="main-content">
	{#if stage === 'landing'}
		<section class="hero">
			<div class="hero-copy">
				<p class="eyebrow"><span></span> {copy.landing.eyebrow}</p>
				<h1 class="stage-heading" bind:this={stageHeading} tabindex="-1">
					<span>{copy.landing.title}</span>
					<em>{copy.landing.titleAccent}</em>
				</h1>
				<p class="hero-description">
					<span>{copy.landing.descriptionFirst}</span>
					<span>{copy.landing.descriptionSecond}</span>
				</p>
				<div class="scenario-picker">
					<p>{copy.landing.scenarioLabel}</p>
					<div class="scenario-options" role="group" aria-label={copy.landing.scenarioLabel}>
						{#each scenarios as item (item)}
							<button
								type="button"
								class:active={scenario === item}
								aria-pressed={scenario === item}
								onclick={() => setScenario(item)}
							>
								<span class="scenario-icon">
									{#if item === 'interview'}
										<Briefcase size={17} />
									{:else if item === 'meeting'}
										<Users size={17} />
									{:else if item === 'presentation'}
										<Presentation size={17} />
									{:else}
										<UserRound size={17} />
									{/if}
								</span>
								<span>
									<strong>{copy.scenarios[item].label}</strong>
									<small>{copy.scenarios[item].description}</small>
								</span>
							</button>
						{/each}
					</div>
				</div>
				<div class="hero-actions">
					<button type="button" class="primary-button" onclick={() => startExperience(false)}>
						<Camera size={19} />
						{scenarioCopy.cta}
						<ArrowRight size={18} />
					</button>
					<button
						type="button"
						class="text-button"
						onclick={openFilePicker}
						disabled={isPreparingImage}
						><Upload size={18} />
						{isPreparingImage ? copy.landing.preparingImage : copy.landing.upload}</button
					>
				</div>
				{#if uploadError}
					<div class="inline-status error" role="alert">
						<CircleAlert size={17} /><span>{uploadError}</span>
					</div>
				{:else if isPreparingImage}
					<div class="inline-status" role="status" aria-live="polite">
						<span class="spinner"><RefreshCw size={16} /></span><span
							>{copy.landing.preparingImage}</span
						>
					</div>
				{/if}
				<p class="microcopy"><ShieldCheck size={15} /> {copy.landing.microcopy}</p>
				<p class="boundary-note">{copy.landing.boundary}</p>
			</div>

			<div class="hero-visual" aria-label={copy.landing.previewAria}>
				<div class="preview-window">
					<div class="preview-toolbar">
						<span><Camera size={15} /> {scenarioCopy.label}</span>
						<small><i></i> {copy.landing.readyCapture}</small>
					</div>
					<div class="preview-image">
						<img
							src="/presence-preview.jpg"
							alt={copy.landing.portraitAlt}
							width="900"
							height="1132"
							fetchpriority="high"
						/>
						<div class="frame-status"><Check size={14} /> {copy.landing.framingGood}</div>
					</div>
					<div class="preview-summary">
						<div class="preview-score">
							<small>{copy.landing.presence}</small>
							<strong>82<span>/100</span></strong>
						</div>
						<div>
							<strong>{scenarioCopy.previewTitle}</strong>
							<span>{copy.landing.previewBody}</span>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="how-it-works">
			<p>{copy.landing.journeyEyebrow}</p>
			<div>
				{#each copy.landing.journey as item, index (item.title)}
					<article>
						<span>0{index + 1}</span><strong>{item.title}</strong><small>{item.description}</small>
					</article>
					{#if index < copy.landing.journey.length - 1}<i></i>{/if}
				{/each}
			</div>
		</section>
	{:else if stage === 'camera'}
		<section class="workspace camera-workspace">
			<div class="workspace-title">
				<p class="eyebrow"><span></span> {copy.camera.eyebrow}</p>
				<span class="context-pill">{scenarioCopy.label}</span>
				<h2 class="stage-heading" bind:this={stageHeading} tabindex="-1">
					{isRetake ? copy.camera.retakeTitle : scenarioCopy.cameraTitle}
				</h2>
				<p>{copy.camera.intro}</p>
			</div>

			<div class="camera-layout">
				<div class="camera-frame">
					<video bind:this={video} muted playsinline aria-label={copy.camera.previewAria}></video>
					<div class="camera-shade"></div>
					<div
						class="oval-guide"
						class:ready={quality.face === 'good' && quality.position === 'good'}
					></div>
					<div class="quality-message">
						<i class:ready={quality.lighting === 'good'}></i>{copy.camera.qualityMessages[
							quality.messageKey
						]}
					</div>
					{#if !stream}<div class="camera-placeholder">
							<Camera size={38} />
							<p>{cameraError || copy.camera.waiting}</p>
						</div>{/if}
				</div>

				<aside class="quality-panel">
					<div class="readiness-card">
						<div>
							<span>{copy.camera.estimatedReadiness}</span><strong>{readinessScore}%</strong>
						</div>
						<div
							class="readiness-track"
							role="progressbar"
							aria-label={copy.camera.estimatedReadiness}
							aria-valuemin="0"
							aria-valuemax="100"
							aria-valuenow={readinessScore}
						>
							<i style={`width:${readinessScore}%`}></i>
						</div>
						<small>{readinessScore >= 90 ? copy.camera.ready : copy.camera.adjust}</small>
					</div>
					<p>{copy.camera.liveGuidance}</p>
					<div class="quality-item">
						<span class:good={quality.face === 'good'}>{quality.face === 'good' ? '✓' : '•'}</span>
						<div>
							<strong>{copy.camera.face}</strong><small>{copy.camera.faceHelp}</small>
						</div>
						<em>{qualityLabel(quality.face)}</em>
					</div>
					<div class="quality-item">
						<span class:good={quality.position === 'good'}
							>{quality.position === 'good' ? '✓' : '•'}</span
						>
						<div>
							<strong>{copy.camera.framing}</strong><small>{copy.camera.framingHelp}</small>
						</div>
						<em>{qualityLabel(quality.position)}</em>
					</div>
					<div class="quality-item">
						<span class:good={quality.lighting === 'good'}
							>{quality.lighting === 'good' ? '✓' : '•'}</span
						>
						<div>
							<strong>{copy.camera.lighting}</strong><small>{copy.camera.lightingHelp}</small>
						</div>
						<em>{qualityLabel(quality.lighting)}</em>
					</div>
					<div class="quality-item">
						<span class:good={quality.background === 'good'}
							>{quality.background === 'good' ? '✓' : '•'}</span
						>
						<div>
							<strong>{copy.camera.background}</strong><small>{copy.camera.backgroundHelp}</small>
						</div>
						<em>{qualityLabel(quality.background)}</em>
					</div>
					<div class="camera-tip">
						<Lightbulb size={18} />
						<p>
							<strong>{copy.camera.quickWin}</strong>
							{scenarioCopy.quickWin}
						</p>
					</div>
					{#if uploadError}
						<div class="inline-status error panel-status" role="alert">
							<CircleAlert size={17} /><span>{uploadError}</span>
						</div>
					{:else if isPreparingImage}
						<div class="inline-status panel-status" role="status" aria-live="polite">
							<span class="spinner"><RefreshCw size={16} /></span><span
								>{copy.camera.preparingImage}</span
							>
						</div>
					{/if}
					<button
						type="button"
						class="primary-button wide"
						onclick={capturePhoto}
						disabled={!stream || isPreparingImage}
						><Camera size={18} /> {copy.camera.capture}</button
					>
					<button
						type="button"
						class="text-button wide"
						onclick={openFilePicker}
						disabled={isPreparingImage}
						><Upload size={17} />
						{isPreparingImage ? copy.camera.preparingImage : copy.camera.upload}</button
					>
					<p class="device-note"><ShieldCheck size={13} /> {copy.camera.deviceNote}</p>
				</aside>
			</div>
		</section>
	{:else if stage === 'review'}
		<section class="workspace review-workspace">
			<div class="workspace-title">
				<p class="eyebrow"><span></span> {copy.review.eyebrow}</p>
				<span class="context-pill">{scenarioCopy.label}</span>
				<h2 class="stage-heading" bind:this={stageHeading} tabindex="-1">{copy.review.title}</h2>
				<p>{copy.review.intro}</p>
			</div>
			<div class="review-card">
				<img src={captureUrl} alt={copy.review.imageAlt} width="1080" height="1350" />
				<div class="review-copy">
					<div class="review-check">
						<Check size={20} />
						<div>
							<strong>{copy.review.complete}</strong>
							<small>{copy.review.privacy}</small>
							{#if preparedImageNote}<small class="prepared-note">{preparedImageNote}</small>{/if}
						</div>
					</div>
					<ul>
						{#each copy.review.checks as item (item)}<li>{item}</li>{/each}
					</ul>
					{#if analysisError}<div class="error-box" role="alert">
							<CircleAlert size={18} /><span>{analysisError}</span>
						</div>{/if}
					<div class="review-actions">
						<button type="button" class="secondary-button" onclick={retake}
							><RefreshCw size={17} /> {copy.review.retake}</button
						><button type="button" class="primary-button" onclick={analyze}
							><ScanFace size={18} /> {copy.review.build} <ArrowRight size={17} /></button
						>
					</div>
				</div>
			</div>
		</section>
	{:else if stage === 'analyzing'}
		<section class="analyzing-screen" role="status" aria-live="polite" aria-busy="true">
			<div class="report-loader"><ScanFace size={34} /></div>
			<p class="eyebrow"><span></span> {copy.analyzing.eyebrow}</p>
			<span class="context-pill">{scenarioCopy.label}</span>
			<h2 class="stage-heading" bind:this={stageHeading} tabindex="-1">{copy.analyzing.title}</h2>
			<p>
				{copy.analyzing.body}<br />{copy.analyzing.timing}
			</p>
			<div class="progress-track"><i></i></div>
			<div class="analysis-steps">
				<span class="done"><Check size={15} /> {copy.analyzing.prepared}</span><span class="active"
					><ScanFace size={15} /> {copy.analyzing.appearance}</span
				><span>{copy.analyzing.actions}</span>
			</div>
			<button type="button" class="text-button cancel-analysis" onclick={cancelAnalysis}>
				{copy.analyzing.cancel}
			</button>
		</section>
	{:else if stage === 'result' && result}
		<section class="workspace result-workspace">
			<div class="result-heading">
				<div>
					<p class="eyebrow"><span></span> {copy.report.eyebrow}</p>
					<h2 class="stage-heading" bind:this={stageHeading} tabindex="-1">
						{scenarioCopy.reportTitle}<br /><em>{scenarioCopy.reportAccent}</em>
					</h2>
					<p>{localizedSummary}</p>
				</div>
				<div class="report-badges">
					<span class="context-badge"
						><small>{copy.report.scenario}</small>{scenarioCopy.label}</span
					>
					<span class="source-badge">{copy.report.source}</span>{#if result.mode === 'demo'}<span
							class="demo-badge">{copy.report.sample}</span
						>{/if}
				</div>
			</div>
			<div class="result-grid">
				<article class="score-card">
					<p class="card-label">{copy.report.overall}</p>
					<div class="score-journey">
						<div>
							<div class="score-circle" style={`--score: ${result.overallScore * 3.6}deg`}>
								<div><strong>{result.overallScore}</strong><small>/ 100</small></div>
							</div>
							<span>{copy.report.current}</span>
						</div>
						<ArrowRight size={19} />
						<div class="projected-score">
							<strong>{projectedScore}</strong><small>+{expectedGain}</small><span
								>{copy.report.estimatedAfter}</span
							>
						</div>
					</div>
					<p>{copy.report.estimateNote}</p>
				</article>
				<article class="metrics-card">
					<p class="card-label">{copy.report.breakdown}</p>
					{#each localizedMetrics as item (item.key)}
						<div class="metric-row">
							<span>{item.label}</span>
							<div
								role="progressbar"
								aria-label={item.label}
								aria-valuemin="0"
								aria-valuemax="100"
								aria-valuenow={item.score}
							>
								<i style={`width:${item.score}%`}></i>
							</div>
							<strong>{item.score}</strong>
						</div>
					{/each}
				</article>
				<article class="tone-card">
					<p class="card-label">{copy.report.colorTone}</p>
					<div class="tone-swatch" style={`background:${result.skinTone.hex}`}></div>
					<div>
						<strong>{copy.report.skinTone.label}</strong><span
							>{copy.report.skinTone.undertone} {copy.report.undertone}</span
						><small>{result.skinTone.hex}</small>
					</div>
					<p class="tone-note">{copy.report.paletteNote}</p>
				</article>
			</div>
			<section class="moment-section">
				<div class="section-heading">
					<div>
						<p class="card-label">{copy.report.momentLabel}</p>
						<h3>{copy.report.momentTitle}</h3>
					</div>
					<span>{scenarioCopy.label}</span>
				</div>
				<ol>
					{#each scenarioCopy.checklist as item, index (item)}
						<li><span>0{index + 1}</span><strong>{item}</strong></li>
					{/each}
				</ol>
			</section>
			<section class="analysis-section">
				<div class="section-heading">
					<div>
						<p class="card-label">{copy.report.appearanceLabel}</p>
						<h3>{copy.report.appearanceTitle}</h3>
					</div>
					<span>{copy.report.observations}</span>
				</div>
				<div class="analysis-grid">
					{#each appearanceInsights as item (item.key)}
						<article>
							<div class="analysis-card-head">
								<span>{item.label}</span><strong>{item.score}</strong>
							</div>
							<h4>{item.summary}</h4>
							<p>{item.insight}</p>
						</article>
					{/each}
				</div>
			</section>
			<div class="guidance-section">
				<div class="section-heading">
					<div>
						<p class="card-label">{copy.report.actionsLabel}</p>
						<h3>{copy.report.actionsTitle}</h3>
					</div>
					<span>{copy.report.prioritized}</span>
				</div>
				<div class="guidance-grid">
					{#each localizedGuidance as guide, index (guide.id)}<article>
							<span>0{index + 1}</span>
							<div>
								<div class="action-meta">
									<small>+{guide.expectedImpact} {copy.report.expected}</small><small
										>{copy.report.difficulty[guide.difficulty]}</small
									>
								</div>
								<h4>{guide.title}</h4>
								<p>{guide.description}</p>
							</div>
						</article>{/each}
				</div>
			</div>
			<div class="result-actions">
				<button type="button" class="secondary-button" onclick={startOver}
					><X size={17} /> {copy.report.startOver}</button
				><button type="button" class="primary-button" onclick={improve}
					><RefreshCw size={18} /> {copy.report.recapture} <ArrowRight size={17} /></button
				>
			</div>
		</section>
	{:else if stage === 'comparison' && result && previousCapture}
		<section class="workspace comparison-workspace">
			<div class="workspace-title">
				<p class="eyebrow"><span></span> {copy.comparison.eyebrow}</p>
				<span class="context-pill">{scenarioCopy.label}</span>
				<h2 class="stage-heading" bind:this={stageHeading} tabindex="-1">
					{copy.comparison.title} <em>{copy.comparison.titleAccent}</em>
				</h2>
				<p>{copy.comparison.intro}</p>
			</div>
			<div class="comparison-stage" style={`--position:${comparisonPosition}%`}>
				<img
					class="after-image"
					src={result.lightingImageUrl || captureUrl}
					alt={copy.comparison.afterAlt}
					width="1080"
					height="1350"
				/>
				<div class="before-layer">
					<img
						src={previousCapture.image}
						alt={copy.comparison.beforeAlt}
						width="1080"
						height="1350"
					/>
				</div>
				<div class="comparison-divider"><span><ArrowRight size={17} /></span></div>
				<div class="comparison-tag before-tag">
					{copy.comparison.before} · {previousCapture.result.overallScore}
				</div>
				<div class="comparison-tag after-tag">{copy.comparison.after} · {result.overallScore}</div>
				<input
					aria-label={copy.comparison.compareAria}
					name="comparison"
					type="range"
					min="0"
					max="100"
					bind:value={comparisonPosition}
				/>
			</div>
			<div class="comparison-outcome">
				<div class="outcome-score">
					<small>{copy.comparison.change}</small><strong>+{comparisonGain}</strong><span
						>{copy.comparison.points}</span
					>
				</div>
				<div>
					<p class="card-label">{copy.comparison.readyLabel}</p>
					<h3>
						{comparisonGain > 0 ? copy.comparison.improved : copy.comparison.ready}
					</h3>
					<p>{copy.comparison.body}</p>
				</div>
			</div>
			<div class="result-actions">
				<button type="button" class="secondary-button" onclick={startOver}
					>{copy.comparison.newReport}</button
				><button type="button" class="primary-button" onclick={() => startExperience(true)}
					><RefreshCw size={18} /> {copy.comparison.captureAgain}</button
				>
			</div>
		</section>
	{/if}
</main>

<input
	bind:this={fileInput}
	hidden
	type="file"
	name="image"
	accept="image/jpeg,image/png"
	aria-label={copy.landing.upload}
	onchange={selectFile}
/>

<SiteFooter
	tagline={copy.footer.tagline}
	disclaimer={copy.footer.disclaimer}
	source={copy.footer.source}
	status={copy.footer.status}
	navigationLabel={copy.footer.navigation}
	primaryHref="/privacy"
	primaryLabel={copy.footer.privacy}
	externalLabel={copy.footer.github}
	externalAriaLabel={copy.footer.githubExternal}
	externalDestination="repository"
/>

<style>
	:global(:root) {
		--ink: #1f2933;
		--muted: #66727d;
		--cream: #f6f7f8;
		--line: #d9dee3;
		--blue: #2f628f;
		--blue-dark: #244e73;
		--sage: #dfe7e2;
		--paper: #ffffff;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		color: var(--ink);
		background: var(--cream);
		overflow-x: hidden;
	}
	:global(button),
	:global(input) {
		font: inherit;
	}
	:global(button) {
		color: inherit;
		touch-action: manipulation;
		-webkit-tap-highlight-color: rgba(68, 110, 131, 0.14);
	}
	:global(em) {
		font-family: inherit;
		font-style: normal;
		font-weight: inherit;
		color: inherit;
	}
	.skip-link {
		position: fixed;
		top: 10px;
		left: 10px;
		z-index: 20;
		padding: 10px 14px;
		border-radius: 4px;
		background: var(--ink);
		color: white;
		font-size: 13px;
		font-weight: 700;
		text-decoration: none;
		transform: translateY(-160%);
		transition: transform 0.16s ease;
	}
	.skip-link:focus-visible {
		transform: translateY(0);
	}
	.stage-heading {
		text-wrap: balance;
		scroll-margin-top: 90px;
	}
	.stage-heading:focus-visible {
		outline: none;
		box-shadow: inset 0 -1px 0 rgba(68, 110, 131, 0.22);
	}
	.site-header {
		height: 88px;
		max-width: 1240px;
		margin: auto;
		padding: 0 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid rgba(52, 57, 53, 0.08);
	}
	.site-header.compact {
		height: 74px;
	}
	.brand {
		min-height: 44px;
		border: 0;
		background: transparent;
		padding: 0;
		cursor: pointer;
		display: flex;
		gap: 10px;
		align-items: center;
		color: var(--ink);
		text-decoration: none;
		font:
			600 18px/1 Georgia,
			serif;
		letter-spacing: -0.02em;
	}
	.brand-lockup {
		display: block;
		width: auto;
		height: 32px;
	}
	.brand-symbol {
		display: none;
		width: auto;
		height: 32px;
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.privacy-note {
		display: flex;
		align-items: center;
		gap: 7px;
		color: var(--muted);
		font-size: 12px;
		text-decoration: none;
	}
	.privacy-note:hover {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.steps {
		display: flex;
		align-items: center;
		padding: 0;
		margin: 0;
		list-style: none;
	}
	.steps li > span:first-child {
		width: 26px;
		height: 26px;
		border: 1px solid var(--line);
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: #9a9890;
		font-size: 11px;
		font-weight: 700;
	}
	.steps li.active > span:first-child {
		color: white;
		background: var(--blue);
		border-color: var(--blue);
	}
	.steps i {
		width: 40px;
		height: 1px;
		background: var(--line);
	}
	.steps i.active {
		background: var(--blue);
	}
	.hero {
		max-width: 1240px;
		min-height: 760px;
		margin: auto;
		padding: 72px 32px 60px;
		display: grid;
		grid-template-columns: 1fr 0.92fr;
		align-items: center;
		gap: 72px;
	}
	.eyebrow {
		color: var(--blue);
		font-size: 11px;
		letter-spacing: 0.17em;
		font-weight: 750;
		display: flex;
		align-items: center;
		gap: 9px;
		margin: 0 0 20px;
	}
	.eyebrow span {
		width: 22px;
		height: 1px;
		background: currentColor;
	}
	.hero h1 {
		font:
			400 clamp(46px, 5.2vw, 72px)/1.14 Georgia,
			'Times New Roman',
			serif;
		letter-spacing: -0.055em;
		margin: 0;
	}
	.hero h1 > span,
	.hero h1 > em {
		display: block;
	}
	.hero-description {
		margin: 28px 0 0;
		color: var(--muted);
		font-size: 16px;
		line-height: 1.8;
		text-wrap: pretty;
	}
	.hero-description span {
		display: block;
	}
	.scenario-picker {
		margin-top: 28px;
	}
	.scenario-picker > p {
		margin: 0 0 11px;
		color: #8b8982;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.16em;
	}
	.scenario-options {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px;
	}
	.scenario-options button {
		min-height: 82px;
		padding: 12px;
		border: 1px solid #dfdcd3;
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.52);
		display: grid;
		grid-template-columns: 34px 1fr;
		gap: 10px;
		align-items: center;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.18s ease,
			background-color 0.18s ease,
			transform 0.18s ease,
			box-shadow 0.18s ease;
	}
	.scenario-options button:hover {
		border-color: #aebdb5;
		transform: translateY(-1px);
	}
	.scenario-options button.active {
		border-color: #8ba69a;
		background: #edf2ed;
		box-shadow: inset 0 0 0 1px rgba(89, 123, 107, 0.12);
	}
	.scenario-options button:focus-visible,
	.primary-button:focus-visible,
	.secondary-button:focus-visible,
	.text-button:focus-visible {
		outline: 3px solid rgba(68, 110, 131, 0.24);
		outline-offset: 2px;
	}
	.scenario-icon {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: #f0efea;
		color: #77766f;
	}
	.scenario-options button.active .scenario-icon {
		background: #d9e5dd;
		color: #496b5b;
	}
	.scenario-options button > span:last-child {
		display: grid;
		gap: 4px;
		min-width: 0;
	}
	.scenario-options strong {
		font-size: 12px;
	}
	.scenario-options small {
		color: #89877f;
		font-size: 10px;
		line-height: 1.35;
		overflow-wrap: anywhere;
	}
	.hero-actions {
		display: flex;
		align-items: center;
		gap: 22px;
		margin-top: 34px;
	}
	.primary-button,
	.secondary-button,
	.text-button {
		border: 0;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		font-weight: 700;
		border-radius: 4px;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.primary-button {
		min-height: 52px;
		padding: 0 20px;
		color: #fff;
		background: var(--blue);
		box-shadow: 0 9px 24px rgba(68, 110, 131, 0.18);
	}
	.primary-button:hover {
		background: var(--blue-dark);
		transform: translateY(-1px);
	}
	.primary-button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		transform: none;
	}
	.secondary-button {
		min-height: 48px;
		padding: 0 20px;
		background: white;
		border: 1px solid var(--line);
	}
	.secondary-button:hover {
		border-color: #a9a69c;
	}
	.text-button {
		padding: 10px 0;
		background: transparent;
		color: #52524e;
	}
	.text-button:hover {
		color: var(--blue);
	}
	.text-button:disabled {
		opacity: 0.55;
		cursor: wait;
	}
	.wide {
		width: 100%;
	}
	.microcopy {
		color: #99978f;
		font-size: 11px;
		display: flex;
		gap: 7px;
		align-items: center;
		margin-top: 18px;
	}
	.boundary-note {
		max-width: 520px;
		margin: 10px 0 0;
		color: #aaa79f;
		font-size: 10px;
		line-height: 1.5;
	}
	.inline-status {
		width: fit-content;
		max-width: 100%;
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin-top: 14px;
		padding: 10px 12px;
		border: 1px solid #d9e1dc;
		border-radius: 4px;
		background: #eef2ee;
		color: #5e6d64;
		font-size: 11px;
		line-height: 1.5;
	}
	.inline-status.error {
		border-color: #ead3cb;
		background: #f8e9e4;
		color: #82493d;
	}
	.inline-status :global(svg) {
		flex: none;
		margin-top: 1px;
	}
	.spinner {
		display: inline-flex;
		animation: spin 0.9s linear infinite;
	}
	.hero-visual {
		position: relative;
		min-height: 520px;
		display: grid;
		place-items: center;
	}
	.preview-window {
		position: relative;
		width: min(100%, 452px);
		background: #fff;
		border: 1px solid #d9d6cd;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 24px 60px rgba(50, 51, 46, 0.12);
	}
	.preview-toolbar {
		height: 54px;
		padding: 0 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #e4e1d9;
		background: #fffefa;
	}
	.preview-toolbar > span,
	.preview-toolbar small {
		display: flex;
		align-items: center;
		gap: 7px;
	}
	.preview-toolbar > span {
		font-size: 12px;
		font-weight: 750;
		letter-spacing: 0.02em;
	}
	.preview-toolbar small {
		color: #728078;
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.preview-toolbar small i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #779a84;
	}
	.preview-image {
		position: relative;
		width: 100%;
		height: 355px;
		overflow: hidden;
		background: #ecebe6;
	}
	.preview-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 38%;
		display: block;
	}
	.frame-status {
		position: absolute;
		left: 16px;
		bottom: 16px;
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 9px 11px;
		border: 1px solid rgba(255, 255, 255, 0.6);
		border-radius: 4px;
		background: rgba(31, 36, 34, 0.72);
		color: white;
		font-size: 10px;
		letter-spacing: 0.03em;
		backdrop-filter: blur(8px);
	}
	.preview-summary {
		min-height: 92px;
		padding: 17px 19px;
		display: grid;
		grid-template-columns: 92px 1fr;
		align-items: center;
		gap: 20px;
		background: #fffefa;
	}
	.preview-summary > div:last-child {
		display: grid;
		gap: 5px;
	}
	.preview-summary > div:last-child strong {
		font:
			600 14px/1.25 Georgia,
			serif;
	}
	.preview-summary > div:last-child span {
		color: #89877f;
		font-size: 10px;
		line-height: 1.4;
	}
	.preview-score {
		padding-right: 18px;
		border-right: 1px solid #dedbd3;
	}
	.preview-score small {
		display: block;
		margin-bottom: 3px;
		color: #99968e;
		font-size: 7px;
		font-weight: 750;
		letter-spacing: 0.14em;
	}
	.preview-score strong {
		font:
			600 29px/1 Georgia,
			serif;
	}
	.preview-score strong span {
		margin-left: 3px;
		color: #99968e;
		font: 8px sans-serif;
	}
	.how-it-works {
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		padding: 31px 32px 35px;
		text-align: center;
		background: rgba(255, 255, 255, 0.35);
	}
	.how-it-works > p,
	.card-label {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.18em;
		color: #98958d;
	}
	.how-it-works > div {
		max-width: 920px;
		margin: 22px auto 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.how-it-works article {
		display: grid;
		grid-template-columns: 34px auto;
		column-gap: 10px;
		text-align: left;
		align-items: center;
	}
	.how-it-works article span {
		grid-row: 1/3;
		width: 32px;
		height: 32px;
		border: 1px solid #b8c7c0;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: #5e7b6e;
		font:
			600 10px Georgia,
			serif;
	}
	.how-it-works article strong {
		font-size: 13px;
	}
	.how-it-works article small {
		font-size: 11px;
		color: #95938c;
		margin-top: 4px;
	}
	.how-it-works > div > i {
		width: 62px;
		height: 1px;
		background: #d8d5cc;
	}
	.workspace {
		max-width: 1120px;
		min-height: 700px;
		margin: auto;
		padding: 58px 32px 80px;
	}
	.workspace-title {
		text-align: center;
		margin-bottom: 35px;
	}
	.workspace-title .eyebrow {
		justify-content: center;
	}
	.context-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: fit-content;
		margin: -6px auto 14px;
		padding: 6px 9px;
		border: 1px solid #ccd8d1;
		border-radius: 999px;
		background: #edf2ed;
		color: #567064;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.analyzing-screen .context-pill {
		margin-top: -7px;
	}
	.workspace-title h2,
	.result-heading h2,
	.analyzing-screen h2 {
		font:
			400 clamp(34px, 4vw, 50px)/1.18 Georgia,
			serif;
		letter-spacing: -0.04em;
		margin: 0;
	}
	.workspace-title > p:last-child,
	.result-heading > div > p:last-child,
	.analyzing-screen > p {
		color: var(--muted);
		font-size: 14px;
		line-height: 1.7;
		margin: 14px 0 0;
	}
	.camera-layout {
		display: grid;
		grid-template-columns: minmax(0, 1.65fr) minmax(280px, 0.72fr);
		background: #fff;
		border: 1px solid var(--line);
		box-shadow: 0 16px 45px rgba(51, 52, 48, 0.09);
	}
	.camera-frame {
		position: relative;
		min-height: 510px;
		overflow: hidden;
		background: #263235;
	}
	.camera-frame video {
		width: 100%;
		height: 100%;
		position: absolute;
		object-fit: cover;
		transform: scaleX(-1);
	}
	.camera-shade {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse 24% 41% at 50% 47%,
			transparent 0 97%,
			rgba(11, 19, 20, 0.48) 101%
		);
	}
	.oval-guide {
		position: absolute;
		left: 50%;
		top: 49%;
		width: 245px;
		height: 350px;
		border: 1.5px solid rgba(255, 255, 255, 0.82);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 18px rgba(255, 255, 255, 0.06);
	}
	.oval-guide.ready {
		border-color: #c6eed2;
		box-shadow: 0 0 20px rgba(198, 238, 210, 0.18);
	}
	.quality-message {
		position: absolute;
		left: 50%;
		bottom: 24px;
		transform: translateX(-50%);
		white-space: nowrap;
		background: rgba(22, 31, 32, 0.73);
		backdrop-filter: blur(8px);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		padding: 10px 15px;
		font-size: 11px;
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.quality-message i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #e4bc7c;
	}
	.quality-message i.ready {
		background: #a8ddb6;
	}
	.camera-placeholder {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 10px;
		color: #bac4c2;
		text-align: center;
		padding: 40px;
	}
	.camera-placeholder p {
		font-size: 13px;
		max-width: 330px;
		line-height: 1.6;
	}
	.quality-panel {
		padding: 28px 25px;
		background: #fbfaf6;
	}
	.readiness-card {
		padding: 17px;
		margin-bottom: 24px;
		background: #eef1ed;
		border: 1px solid #dce3dd;
	}
	.readiness-card > div:first-child {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}
	.readiness-card span {
		font-size: 8px;
		font-weight: 800;
		letter-spacing: 0.15em;
		color: #708177;
	}
	.readiness-card strong {
		font:
			500 26px Georgia,
			serif;
		color: #486757;
	}
	.readiness-track {
		height: 3px;
		margin: 10px 0;
		background: #d8ded9;
		overflow: hidden;
	}
	.readiness-track i {
		display: block;
		height: 100%;
		background: #6f8d7e;
		transition: width 0.35s ease;
	}
	.readiness-card small {
		font-size: 9px;
		color: #7e817c;
	}
	.quality-panel > p {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.18em;
		color: #98958d;
		margin: 0 0 22px;
	}
	.quality-item {
		display: grid;
		grid-template-columns: 28px 1fr auto;
		gap: 10px;
		align-items: start;
		padding: 15px 0;
		border-bottom: 1px solid #ebe8df;
	}
	.quality-item > span {
		width: 22px;
		height: 22px;
		border: 1px solid #d0ccc2;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: #b7b3a9;
		font-size: 12px;
	}
	.quality-item > span.good {
		background: #dce9df;
		border-color: #bfd2c3;
		color: #52745c;
	}
	.quality-item strong {
		display: block;
		font-size: 13px;
		margin: 2px 0 5px;
	}
	.quality-item small {
		display: block;
		color: #97948c;
		font-size: 11px;
		line-height: 1.4;
	}
	.quality-item em {
		font-family: inherit;
		font-style: normal;
		color: #8f8c84;
		font-size: 10px;
		margin-top: 4px;
	}
	.camera-tip {
		display: flex;
		gap: 10px;
		color: #5e6861;
		background: #eef1eb;
		padding: 13px;
		margin: 19px 0;
	}
	.camera-tip :global(svg) {
		flex: none;
		color: #617a6d;
	}
	.camera-tip p {
		font-size: 11px;
		line-height: 1.55;
		margin: 0;
	}
	.camera-tip strong {
		display: block;
		margin-bottom: 2px;
	}
	.quality-panel .text-button {
		font-size: 11px;
		margin-top: 5px;
	}
	.device-note {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		margin: 3px 0 0;
		color: #9a978f;
		font-size: 10px;
		letter-spacing: 0.03em;
	}
	.review-card {
		max-width: 850px;
		margin: auto;
		display: grid;
		grid-template-columns: 0.9fr 1.1fr;
		background: white;
		border: 1px solid var(--line);
		box-shadow: 0 18px 45px rgba(50, 51, 47, 0.09);
	}
	.review-card > img {
		width: 100%;
		height: 465px;
		object-fit: cover;
	}
	.review-copy {
		padding: 40px 38px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.review-check {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-bottom: 20px;
		border-bottom: 1px solid #ebe8df;
	}
	.review-check > :global(svg) {
		width: 32px;
		height: 32px;
		padding: 7px;
		border-radius: 50%;
		background: #e2eee5;
		color: #597463;
	}
	.review-check strong,
	.review-check small {
		display: block;
	}
	.review-check strong {
		font:
			600 18px Georgia,
			serif;
	}
	.review-check small {
		color: #929087;
		font-size: 11px;
		margin-top: 5px;
		line-height: 1.45;
	}
	.review-check .prepared-note {
		color: #5e7868;
		font-weight: 650;
	}
	.review-copy ul {
		padding: 17px 0 17px 18px;
		margin: 0;
		color: #66655f;
		font-size: 12px;
		line-height: 2;
	}
	.review-actions {
		display: flex;
		gap: 9px;
		margin-top: 10px;
	}
	.review-actions button {
		flex: 1;
	}
	.error-box {
		display: flex;
		gap: 9px;
		align-items: flex-start;
		padding: 12px;
		background: #f8e9e4;
		color: #8a4c3e;
		font-size: 11px;
		line-height: 1.5;
		margin-bottom: 9px;
	}
	.error-box :global(svg) {
		flex: none;
	}
	.analyzing-screen {
		min-height: 700px;
		display: grid;
		place-content: center;
		justify-items: center;
		text-align: center;
		padding: 40px;
	}
	.report-loader {
		width: 104px;
		height: 104px;
		border: 1px solid #cbd4cf;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: var(--blue);
		position: relative;
		margin-bottom: 36px;
		background: #f0f3f0;
	}
	.analyzing-screen .eyebrow {
		margin-top: 4px;
	}
	.progress-track {
		width: 340px;
		height: 2px;
		background: #dedbd3;
		margin-top: 38px;
		overflow: hidden;
	}
	.progress-track i {
		display: block;
		width: 42%;
		height: 100%;
		background: var(--blue);
		animation: progress 2.2s ease-in-out infinite;
	}
	.analysis-steps {
		display: flex;
		width: 400px;
		justify-content: space-between;
		margin-top: 18px;
		color: #aaa69d;
		font-size: 10px;
		letter-spacing: 0.06em;
	}
	.analysis-steps span {
		display: flex;
		align-items: center;
		gap: 5px;
	}
	.analysis-steps .done {
		color: #738a79;
	}
	.analysis-steps .active {
		color: var(--blue);
		font-weight: 700;
	}
	.cancel-analysis {
		margin-top: 24px;
		font-size: 12px;
	}
	.panel-status {
		width: 100%;
		margin: 15px 0 4px;
	}
	@keyframes progress {
		0% {
			transform: translateX(-110%);
		}
		60%,
		100% {
			transform: translateX(280%);
		}
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.result-workspace {
		max-width: 1080px;
	}
	.result-heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 40px;
	}
	.result-heading h2 {
		font-size: 43px;
	}
	.report-badges {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
		flex-wrap: wrap;
		max-width: 290px;
	}
	.context-badge {
		min-width: 110px;
		display: grid;
		gap: 2px;
		padding: 8px 10px;
		border: 1px solid #c8d3db;
		border-radius: 2px;
		background: #edf2f4;
		color: #3f6273;
		font-size: 11px;
		font-weight: 750;
	}
	.context-badge small {
		font-size: 7px;
		letter-spacing: 0.12em;
		color: #7e929c;
	}
	.source-badge {
		display: inline-flex;
		align-items: center;
		font-size: 9px;
		font-weight: 750;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		border: 1px solid #cbd9d0;
		background: #edf2ed;
		color: #567064;
		padding: 8px 10px;
		border-radius: 2px;
	}
	.demo-badge {
		font-size: 9px;
		letter-spacing: 0.13em;
		border: 1px solid #d2c6a7;
		background: #fbf3dd;
		color: #776644;
		padding: 8px 10px;
		border-radius: 2px;
	}
	.result-grid {
		display: grid;
		grid-template-columns: 1.05fr 1.25fr 0.82fr;
		gap: 14px;
	}
	.result-grid > article {
		background: white;
		border: 1px solid var(--line);
		padding: 27px;
	}
	.score-card {
		text-align: center;
	}
	.score-card > .card-label {
		margin: 0 0 20px;
	}
	.score-journey {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 16px;
	}
	.score-journey > :global(svg) {
		flex: none;
		color: #a5a39c;
	}
	.score-journey > div > span,
	.projected-score span {
		display: block;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #99968e;
	}
	.score-circle {
		width: 92px;
		height: 92px;
		margin: 0 auto 8px;
		border-radius: 50%;
		background: conic-gradient(var(--blue) var(--score), #e5e3dc 0);
		display: grid;
		place-items: center;
		position: relative;
	}
	.score-circle:after {
		content: '';
		position: absolute;
		inset: 8px;
		border-radius: 50%;
		background: white;
	}
	.score-circle > div {
		z-index: 1;
	}
	.score-circle strong {
		font:
			400 29px Georgia,
			serif;
	}
	.score-circle small {
		display: block;
		color: #99968e;
		font-size: 8px;
	}
	.projected-score {
		min-width: 88px;
		padding: 16px 10px 12px;
		background: #e9efea;
		border: 1px solid #d5e0d8;
	}
	.projected-score strong {
		font:
			400 32px Georgia,
			serif;
	}
	.projected-score small {
		display: inline-block;
		margin-left: 4px;
		color: #52705d;
		font-size: 9px;
		font-weight: 800;
	}
	.projected-score span {
		margin-top: 9px;
	}
	.score-card p {
		font-size: 10px;
		line-height: 1.5;
		color: #99968e;
		margin: 0;
	}
	.metrics-card .card-label,
	.tone-card .card-label {
		margin: 0 0 22px;
	}
	.metric-row {
		display: grid;
		grid-template-columns: 72px 1fr 25px;
		align-items: center;
		gap: 10px;
		margin: 15px 0;
		font-size: 11px;
	}
	.metric-row > div {
		height: 4px;
		background: #e9e7e0;
	}
	.metric-row i {
		display: block;
		height: 100%;
		background: #78968a;
	}
	.metric-row strong {
		font:
			600 11px Georgia,
			serif;
		text-align: right;
	}
	.tone-card {
		display: grid;
		grid-template-columns: 68px 1fr;
		align-content: center;
		column-gap: 16px;
	}
	.tone-card .card-label {
		grid-column: 1/3;
	}
	.tone-swatch {
		width: 68px;
		height: 68px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 8px rgba(255, 255, 255, 0.45);
	}
	.tone-card strong,
	.tone-card span,
	.tone-card small {
		display: block;
	}
	.tone-card strong {
		font:
			600 14px Georgia,
			serif;
	}
	.tone-card span {
		font-size: 10px;
		color: #85827b;
		margin: 5px 0;
	}
	.tone-card small {
		font-size: 9px;
		color: #aaa69d;
	}
	.tone-note {
		grid-column: 1/3;
		margin: 16px 0 0;
		padding-top: 13px;
		border-top: 1px solid #ebe8df;
		color: #7f7d76;
		font-size: 10px;
		line-height: 1.5;
	}
	.moment-section {
		margin-top: 18px;
		padding: 30px;
		border: 1px solid #cedbd3;
		background: #edf2ed;
	}
	.moment-section ol {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	.moment-section li {
		min-height: 84px;
		padding: 22px 20px 0 0;
		display: grid;
		grid-template-columns: 28px 1fr;
		gap: 9px;
		align-items: start;
	}
	.moment-section li + li {
		padding-left: 20px;
		border-left: 1px solid #ced8d1;
	}
	.moment-section li span {
		color: #6d8a7b;
		font:
			600 11px Georgia,
			serif;
	}
	.moment-section li strong {
		font-size: 12px;
		line-height: 1.55;
	}
	.analysis-section {
		margin-top: 18px;
		padding: 30px;
		background: white;
		border: 1px solid var(--line);
	}
	.analysis-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}
	.analysis-grid article {
		padding: 22px 18px 2px 0;
	}
	.analysis-grid article + article {
		padding-left: 18px;
		border-left: 1px solid #e2dfd7;
	}
	.analysis-card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		font-size: 10px;
		font-weight: 750;
		letter-spacing: 0.05em;
		color: #77756f;
	}
	.analysis-card-head strong {
		font:
			500 18px Georgia,
			serif;
		color: var(--blue);
	}
	.analysis-grid h4 {
		font:
			600 14px/1.35 Georgia,
			serif;
		margin: 15px 0 8px;
	}
	.analysis-grid p {
		font-size: 11px;
		line-height: 1.6;
		color: #85837c;
		margin: 0;
	}
	.guidance-section {
		margin-top: 18px;
		background: #ebece6;
		border: 1px solid #dbddd5;
		padding: 30px;
	}
	.section-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		border-bottom: 1px solid #d4d6ce;
		padding-bottom: 18px;
	}
	.section-heading p {
		margin: 0 0 8px;
	}
	.section-heading h3 {
		font:
			600 23px Georgia,
			serif;
		margin: 0;
	}
	.section-heading > span {
		font-size: 10px;
		color: #92918a;
	}
	.guidance-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}
	.guidance-grid article {
		display: grid;
		grid-template-columns: 28px 1fr;
		gap: 10px;
		padding: 24px 20px 5px 0;
	}
	.guidance-grid article + article {
		border-left: 1px solid #d4d6ce;
		padding-left: 20px;
	}
	.guidance-grid article > span {
		font:
			600 11px Georgia,
			serif;
		color: #738d80;
	}
	.guidance-grid small {
		color: #708a7d;
		font-size: 9px;
		letter-spacing: 0.12em;
		font-weight: 800;
	}
	.action-meta {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.action-meta small + small {
		color: #9a978f;
		padding-left: 8px;
		border-left: 1px solid #cfd3cc;
	}
	.guidance-grid h4 {
		font:
			600 14px/1.4 Georgia,
			serif;
		margin: 8px 0;
	}
	.guidance-grid p {
		color: #74736d;
		font-size: 11px;
		line-height: 1.6;
		margin: 0;
	}
	.result-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 24px;
	}
	.comparison-workspace em {
		font-style: italic;
	}
	.comparison-stage {
		position: relative;
		max-width: 850px;
		height: 520px;
		margin: auto;
		overflow: hidden;
		background: #dde3df;
		border: 10px solid white;
		box-shadow: 0 18px 48px rgba(51, 52, 47, 0.13);
		touch-action: pan-y;
	}
	.comparison-stage img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.before-layer {
		position: absolute;
		inset: 0;
		clip-path: inset(0 calc(100% - var(--position)) 0 0);
		overflow: hidden;
	}
	.comparison-divider {
		position: absolute;
		top: 0;
		bottom: 0;
		left: var(--position);
		width: 2px;
		background: rgba(255, 255, 255, 0.92);
		transform: translateX(-1px);
		pointer-events: none;
	}
	.comparison-divider span {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 40px;
		height: 40px;
		display: grid;
		place-items: center;
		transform: translate(-50%, -50%);
		background: var(--blue);
		color: white;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.9);
		box-shadow: 0 5px 18px rgba(32, 45, 48, 0.25);
	}
	.comparison-divider :global(svg) {
		transform: rotate(180deg);
	}
	.comparison-tag {
		position: absolute;
		top: 18px;
		z-index: 3;
		padding: 8px 10px;
		background: rgba(27, 34, 35, 0.66);
		backdrop-filter: blur(8px);
		color: white;
		font-size: 8px;
		font-weight: 800;
		letter-spacing: 0.12em;
		border: 1px solid rgba(255, 255, 255, 0.22);
	}
	.before-tag {
		left: 18px;
	}
	.after-tag {
		right: 18px;
	}
	.comparison-stage input {
		position: absolute;
		inset: 0;
		z-index: 4;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: ew-resize;
	}
	.comparison-outcome {
		max-width: 850px;
		margin: 20px auto 0;
		padding: 22px 26px;
		background: #e8ede8;
		border: 1px solid #d0dad1;
		display: grid;
		grid-template-columns: 110px 1fr;
		gap: 24px;
		align-items: center;
	}
	.outcome-score {
		padding-right: 24px;
		border-right: 1px solid #cbd6cd;
		text-align: center;
	}
	.outcome-score small,
	.outcome-score span {
		display: block;
		font-size: 7px;
		font-weight: 800;
		letter-spacing: 0.12em;
		color: #718077;
	}
	.outcome-score strong {
		display: block;
		font:
			500 38px Georgia,
			serif;
		color: #4f6c5c;
		margin: 4px 0;
	}
	.readiness-card strong,
	.preview-score strong,
	.score-circle strong,
	.projected-score strong,
	.metric-row strong,
	.analysis-card-head strong,
	.outcome-score strong {
		font-variant-numeric: tabular-nums;
	}
	.comparison-outcome h3 {
		font:
			600 17px Georgia,
			serif;
		margin: 0;
	}
	.comparison-outcome p:last-child {
		margin: 7px 0 0;
		color: #77766f;
		font-size: 10px;
		line-height: 1.5;
	}
	.comparison-workspace .result-actions {
		max-width: 850px;
		margin-left: auto;
		margin-right: auto;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	/* Calm, practical product language: flat surfaces, restrained color, sans-serif hierarchy. */
	.site-header {
		background: var(--cream);
	}
	.brand {
		font: 700 16px/1 inherit;
		letter-spacing: -0.01em;
	}
	.hero {
		min-height: 700px;
		padding-top: 64px;
		gap: 64px;
	}
	.eyebrow {
		margin-bottom: 16px;
		color: #5f6e79;
		font-size: 10px;
		letter-spacing: 0.09em;
	}
	.eyebrow span {
		display: none;
	}
	.hero h1 {
		max-width: 620px;
		font-family: inherit;
		font-size: clamp(42px, 4.7vw, 60px);
		font-weight: 700;
		line-height: 1.08;
		letter-spacing: -0.045em;
	}
	.hero h1 em {
		color: var(--ink);
	}
	.hero-description {
		max-width: 600px;
		margin-top: 22px;
		font-size: 15px;
		line-height: 1.65;
	}
	.scenario-picker {
		margin-top: 24px;
	}
	.scenario-picker > p,
	.how-it-works > p,
	.card-label {
		color: #64717b;
		font-size: 10px;
		letter-spacing: 0.08em;
	}
	.scenario-options {
		gap: 10px;
	}
	.scenario-options button {
		min-height: 88px;
		border-color: var(--line);
		border-radius: 8px;
		background: #fff;
		transition:
			border-color 0.18s ease,
			background-color 0.18s ease,
			box-shadow 0.18s ease;
	}
	.scenario-options button:hover {
		border-color: #9aa8b4;
		background: #fafbfc;
		transform: none;
	}
	.scenario-options button.active {
		border-color: #8fa9bf;
		background: #f4f8fb;
		box-shadow: inset 3px 0 0 var(--blue);
	}
	.scenario-icon {
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: #f0f2f4;
		color: #65717b;
	}
	.scenario-options button.active .scenario-icon {
		background: #e4edf4;
		color: var(--blue);
	}
	.scenario-options strong {
		font-size: 13px;
	}
	.scenario-options small {
		font-size: 10px;
	}
	.hero-actions {
		margin-top: 28px;
	}
	.primary-button,
	.secondary-button,
	.text-button {
		border-radius: 8px;
	}
	.primary-button {
		box-shadow: none;
	}
	.primary-button:hover {
		transform: none;
	}
	.boundary-note {
		color: #89939c;
		font-size: 10px;
	}
	.preview-window {
		border-color: #cfd5da;
		border-radius: 12px;
		box-shadow: 0 10px 28px rgba(31, 41, 51, 0.08);
	}
	.preview-toolbar,
	.preview-summary {
		background: #fff;
	}
	.frame-status {
		border: 0;
		border-radius: 6px;
		background: rgba(31, 41, 51, 0.88);
		backdrop-filter: none;
	}
	.preview-summary > div:last-child strong,
	.preview-score strong {
		font-family: inherit;
		font-weight: 700;
	}
	.how-it-works {
		background: #fff;
	}
	.how-it-works article span {
		border-color: #c3cbd2;
		border-radius: 6px;
		color: #53616c;
		font-family: inherit;
		font-weight: 700;
	}
	.workspace-title h2,
	.result-heading h2,
	.analyzing-screen h2 {
		font-family: inherit;
		font-weight: 700;
		letter-spacing: -0.035em;
	}
	.context-pill {
		border-color: #ccd5dc;
		border-radius: 5px;
		background: #fff;
		color: #536979;
	}
	.camera-layout,
	.review-card {
		overflow: hidden;
		border-radius: 12px;
		box-shadow: none;
	}
	.quality-panel {
		background: #fff;
	}
	.readiness-card {
		border-color: #dce2e7;
		background: #f4f6f8;
	}
	.readiness-card strong,
	.review-check strong {
		font-family: inherit;
		font-weight: 700;
	}
	.camera-tip {
		border-left: 3px solid #8aa2b4;
		background: #f3f6f8;
	}
	.quality-message,
	.comparison-tag {
		backdrop-filter: none;
	}
	.report-loader {
		width: 72px;
		height: 72px;
		border-radius: 12px;
		background: #fff;
	}
	.result-heading h2 {
		font-size: 38px;
	}
	.result-heading h2 em {
		color: #536979;
	}
	.context-badge,
	.source-badge,
	.demo-badge {
		border-radius: 6px;
	}
	.source-badge {
		text-transform: none;
		letter-spacing: 0.04em;
	}
	.result-grid > article,
	.analysis-section,
	.guidance-section,
	.moment-section {
		border-radius: 8px;
	}
	.score-circle {
		width: 92px;
		height: 72px;
		border: 1px solid #d9e0e5;
		border-radius: 7px;
		background: #f6f8f9;
	}
	.score-circle:after {
		display: none;
	}
	.score-circle strong,
	.projected-score strong,
	.metric-row strong,
	.analysis-card-head strong,
	.outcome-score strong {
		font-family: inherit;
		font-weight: 700;
	}
	.projected-score {
		border-color: #d8e0e5;
		border-radius: 7px;
		background: #eef3f6;
	}
	.tone-swatch {
		border-radius: 8px;
		box-shadow: none;
	}
	.tone-card strong,
	.moment-section li span,
	.analysis-grid h4,
	.section-heading h3,
	.guidance-grid article > span,
	.guidance-grid h4,
	.comparison-outcome h3 {
		font-family: inherit;
	}
	.moment-section {
		border-color: #d4dce2;
		border-left: 3px solid var(--blue);
		background: #fff;
	}
	.analysis-section {
		background: #fff;
	}
	.guidance-section {
		border-color: #dce1e5;
		background: #f5f7f8;
	}
	.comparison-workspace em {
		font-style: normal;
	}
	.comparison-stage {
		border: 1px solid #d5dce1;
		border-radius: 10px;
		box-shadow: none;
	}
	.comparison-outcome {
		border-color: #d8e0e5;
		border-radius: 8px;
		background: #f2f5f7;
	}
	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 25px;
			padding-top: 48px;
		}
		.hero-copy {
			max-width: 680px;
			margin: auto;
		}
		.hero-visual {
			min-height: 500px;
		}
		.camera-layout {
			grid-template-columns: 1fr;
		}
		.camera-frame {
			min-height: 520px;
		}
		.quality-panel {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0 15px;
		}
		.quality-panel > p,
		.quality-panel > .readiness-card,
		.quality-panel > .camera-tip,
		.quality-panel > .panel-status,
		.quality-panel > button,
		.quality-panel > .device-note {
			grid-column: 1/3;
		}
		.result-grid {
			grid-template-columns: 1fr 1fr;
		}
		.metrics-card {
			grid-column: 2;
		}
		.tone-card {
			grid-column: 1/3;
		}
		.guidance-grid {
			grid-template-columns: 1fr;
		}
		.moment-section ol {
			grid-template-columns: 1fr;
		}
		.moment-section li,
		.moment-section li + li {
			min-height: 0;
			padding: 18px 0;
			border-left: 0;
			border-top: 1px solid #ced8d1;
		}
		.moment-section li:first-child {
			border-top: 0;
		}
		.analysis-grid {
			grid-template-columns: 1fr 1fr;
		}
		.analysis-grid article:nth-child(3) {
			padding-left: 0;
			border-left: 0;
			border-top: 1px solid #e2dfd7;
		}
		.analysis-grid article:nth-child(4) {
			border-top: 1px solid #e2dfd7;
		}
		.guidance-grid article + article {
			border-left: 0;
			border-top: 1px solid #d4d6ce;
			padding-left: 0;
		}
		.result-heading {
			display: block;
		}
		.demo-badge {
			display: inline-block;
			margin-top: 0;
		}
		.report-badges {
			justify-content: flex-start;
			margin-top: 20px;
		}
	}
	@media (max-width: 620px) {
		.site-header {
			height: 68px;
			padding: 0 19px;
		}
		.site-header.compact {
			height: 62px;
		}
		.privacy-note {
			display: none;
		}
		.header-actions {
			gap: 10px;
		}
		.brand-lockup {
			height: 29px;
		}
		.site-header.compact .brand-lockup {
			display: none;
		}
		.site-header.compact .brand-symbol {
			display: block;
		}
		.hero {
			padding: 45px 20px;
		}
		.hero h1 {
			font-size: clamp(38px, 10.8vw, 42px);
			line-height: 1.12;
		}
		.hero-description span {
			display: inline;
		}
		.hero-description span + span::before {
			content: ' ';
		}
		.scenario-picker {
			margin-top: 23px;
		}
		.scenario-options {
			gap: 7px;
		}
		.scenario-options button {
			min-height: 104px;
			padding: 10px;
			grid-template-columns: 1fr;
			gap: 7px;
			align-content: start;
		}
		.scenario-icon {
			width: 30px;
			height: 30px;
		}
		.scenario-options small {
			font-size: 10px;
		}
		.hero-actions {
			align-items: stretch;
			flex-direction: column;
			gap: 8px;
			margin-top: 25px;
		}
		.hero-visual {
			min-height: 465px;
			margin: 0;
		}
		.preview-window {
			width: 100%;
		}
		.preview-image {
			height: 320px;
		}
		.preview-summary {
			grid-template-columns: 80px 1fr;
			gap: 14px;
			padding: 16px;
		}
		.how-it-works > div {
			display: grid;
			gap: 18px;
			justify-content: stretch;
		}
		.how-it-works article {
			width: 100%;
		}
		.how-it-works > div > i {
			display: none;
		}
		.workspace {
			padding: 42px 17px 65px;
		}
		.workspace-title h2,
		.result-heading h2,
		.analyzing-screen h2 {
			font-size: 34px;
		}
		.camera-frame {
			min-height: 470px;
		}
		.quality-panel {
			display: block;
		}
		.review-card {
			grid-template-columns: 1fr;
		}
		.review-card > img {
			height: 390px;
		}
		.review-copy {
			padding: 27px 22px;
		}
		.review-actions,
		.result-actions {
			flex-direction: column;
		}
		.result-grid {
			grid-template-columns: 1fr;
		}
		.metrics-card,
		.tone-card {
			grid-column: auto;
		}
		.guidance-section {
			padding: 22px 18px;
		}
		.moment-section {
			padding: 22px 18px;
		}
		.analysis-section {
			padding: 22px 18px;
		}
		.section-heading {
			align-items: start;
		}
		.section-heading > span {
			display: none;
		}
		.comparison-stage {
			height: 430px;
			border-width: 7px;
		}
		.comparison-outcome {
			grid-template-columns: 1fr;
			gap: 16px;
			padding: 20px;
		}
		.outcome-score {
			display: flex;
			align-items: baseline;
			justify-content: center;
			gap: 7px;
			padding: 0 0 16px;
			border-right: 0;
			border-bottom: 1px solid #cbd6cd;
		}
		.outcome-score strong {
			margin: 0;
		}
		.analysis-grid {
			grid-template-columns: 1fr;
		}
		.analysis-grid article,
		.analysis-grid article + article,
		.analysis-grid article:nth-child(3) {
			padding: 18px 0;
			border-left: 0;
			border-top: 1px solid #e2dfd7;
		}
		.analysis-grid article:first-child {
			border-top: 0;
		}
		.analyzing-screen {
			padding: 25px;
		}
		.progress-track {
			width: 260px;
		}
		.analysis-steps {
			width: 290px;
		}
		.steps i {
			width: 25px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.skip-link,
		.primary-button,
		.secondary-button,
		.text-button,
		.readiness-track i {
			transition: none;
		}
		.progress-track i,
		.spinner {
			animation: none;
		}
	}
</style>
