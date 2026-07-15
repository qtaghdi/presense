<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		ArrowRight,
		Camera,
		Check,
		CircleAlert,
		Lightbulb,
		RefreshCw,
		ScanFace,
		ShieldCheck,
		Upload,
		X
	} from '@lucide/svelte';
	import {
		analysisResultSchema,
		type AnalysisResult
	} from '$lib/domains/analysis/shared/contracts';
	import { isLocale, messages, type Locale } from '$lib/i18n/messages';
	import type { CameraQuality } from '$lib/domains/camera/shared/contracts';
	import { inspectFrame } from '$lib/domains/camera/client/quality';
	import {
		clearBeforeCapture,
		readBeforeCapture,
		saveBeforeCapture,
		type StoredCapture
	} from '$lib/domains/comparison/client/storage';

	type Stage = 'landing' | 'camera' | 'review' | 'analyzing' | 'result' | 'comparison';

	let stage = $state<Stage>('landing');
	let locale = $state<Locale>('en');
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
	let quality = $state<CameraQuality>({
		face: 'unknown',
		position: 'unknown',
		lighting: 'unknown',
		brightness: 0.58,
		messageKey: 'preparing'
	});
	let qualityTimer: ReturnType<typeof setInterval> | undefined;
	const copy = $derived(messages[locale]);

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
			(quality.face === 'good' ? 36 : quality.face === 'warning' ? 12 : 20) +
				(quality.position === 'good' ? 34 : quality.position === 'warning' ? 12 : 18) +
				(quality.lighting === 'good' ? 30 : quality.lighting === 'warning' ? 10 : 16)
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
			: result.mode === 'demo'
				? copy.report.summarySample
				: result.overallScore >= 75
					? copy.report.summaryPositive
					: copy.report.summaryFocused
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
		document.documentElement.lang = locale;
		previousCapture = readBeforeCapture();
		return () => stopCamera();
	});

	function setLocale(nextLocale: Locale) {
		locale = nextLocale;
		localStorage.setItem('presence-locale', nextLocale);
		document.documentElement.lang = nextLocale;
	}

	async function startExperience(retake = false) {
		isRetake = retake;
		analysisError = '';
		stage = 'camera';
		await tick();
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
				if (cameraVideo.readyState >= 2) quality = await inspectFrame(cameraVideo);
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
		captureFile = new File([blob], `presence-${Date.now()}.jpg`, { type: 'image/jpeg' });
		captureUrl = canvas.toDataURL('image/jpeg', 0.84);
		stopCamera();
		stage = 'review';
	}

	async function selectFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 10 * 1024 * 1024) {
			cameraError = copy.camera.errors.file;
			input.value = '';
			return;
		}
		captureFile = file;
		captureUrl = await readFile(file);
		quality = { ...quality, brightness: await measureBrightness(captureUrl) };
		stopCamera();
		stage = 'review';
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
		await startExperience(isRetake);
	}

	async function analyze() {
		if (!captureFile) return;
		analysisError = '';
		stage = 'analyzing';
		const form = new FormData();
		form.set('image', captureFile);
		form.set('brightness', String(quality.brightness));
		form.set('locale', locale);

		try {
			const response = await fetch('/api/analyze', { method: 'POST', body: form });
			const body = await response.json();
			if (!response.ok) throw new Error(body.message ?? copy.review.errors.generic);
			result = analysisResultSchema.parse(body);
			if (isRetake && previousCapture) {
				stage = 'comparison';
			} else {
				stage = 'result';
			}
		} catch (error) {
			analysisError = error instanceof Error ? error.message : copy.review.errors.interrupted;
			stage = 'review';
		}
	}

	function improve() {
		if (!result || !captureUrl) return;
		previousCapture = { image: captureUrl, result };
		saveBeforeCapture(previousCapture);
		void startExperience(true);
	}

	function startOver() {
		clearBeforeCapture();
		previousCapture = null;
		captureFile = null;
		captureUrl = '';
		result = null;
		isRetake = false;
		comparisonPosition = 50;
		stage = 'landing';
	}

	function qualityLabel(value: CameraQuality['face']) {
		return copy.camera.labels[value];
	}
</script>

<svelte:head>
	<title>{copy.meta.title}</title>
	<meta name="description" content={copy.meta.description} />
</svelte:head>

<header class="site-header" class:compact={stage !== 'landing'}>
	<button type="button" class="brand" aria-label={copy.header.home} onclick={startOver}>
		<span class="brand-mark">P</span>
		<span>Presence</span>
	</button>
	<div class="header-actions">
		{#if stage === 'landing'}
			<div class="privacy-note">
				<ShieldCheck size={16} /><span>{copy.header.privacy}</span>
			</div>
		{:else}
			<div class="steps" aria-label={copy.header.progress}>
				{#each [1, 2, 3] as step (step)}
					<span class:active={step <= stepNumber}>{step < stepNumber ? '✓' : step}</span>
					{#if step < 3}<i class:active={step < stepNumber}></i>{/if}
				{/each}
			</div>
		{/if}
		<div class="language-switch" role="group" aria-label={copy.header.language}>
			<button
				type="button"
				class:active={locale === 'en'}
				aria-pressed={locale === 'en'}
				onclick={() => setLocale('en')}>EN</button
			>
			<button
				type="button"
				class:active={locale === 'ko'}
				aria-pressed={locale === 'ko'}
				onclick={() => setLocale('ko')}>한국어</button
			>
		</div>
	</div>
</header>

<main>
	{#if stage === 'landing'}
		<section class="hero">
			<div class="hero-copy">
				<p class="eyebrow"><span></span> {copy.landing.eyebrow}</p>
				<h1>{copy.landing.title}<br /><em>{copy.landing.titleAccent}</em></h1>
				<p class="hero-description">
					{copy.landing.descriptionFirst}<br />{copy.landing.descriptionSecond}
				</p>
				<div class="hero-actions">
					<button class="primary-button" onclick={() => startExperience(false)}>
						<Camera size={19} />
						{copy.landing.startCamera}
						<ArrowRight size={18} />
					</button>
					<button class="text-button" onclick={() => fileInput.click()}
						><Upload size={18} /> {copy.landing.upload}</button
					>
				</div>
				<p class="microcopy"><ShieldCheck size={15} /> {copy.landing.microcopy}</p>
			</div>

			<div class="hero-visual" aria-label={copy.landing.previewAria}>
				<div class="preview-window">
					<div class="preview-toolbar">
						<span><Camera size={15} /> {copy.landing.cameraCheck}</span>
						<small><i></i> {copy.landing.readyCapture}</small>
					</div>
					<div class="preview-image">
						<img src="/presence-preview.jpg" alt={copy.landing.portraitAlt} />
						<div class="frame-status"><Check size={14} /> {copy.landing.framingGood}</div>
					</div>
					<div class="preview-summary">
						<div class="preview-score">
							<small>{copy.landing.presence}</small>
							<strong>82<span>/100</span></strong>
						</div>
						<div>
							<strong>{copy.landing.previewTitle}</strong>
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
				<h2>{isRetake ? copy.camera.retakeTitle : copy.camera.title}</h2>
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
						<div class="readiness-track"><i style={`width:${readinessScore}%`}></i></div>
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
					<div class="camera-tip">
						<Lightbulb size={18} />
						<p>
							<strong>{copy.camera.quickWin}</strong>
							{copy.camera.quickWinBody}
						</p>
					</div>
					<button class="primary-button wide" onclick={capturePhoto} disabled={!stream}
						><Camera size={18} /> {copy.camera.capture}</button
					>
					<button class="text-button wide" onclick={() => fileInput.click()}
						><Upload size={17} /> {copy.camera.upload}</button
					>
					<p class="device-note"><ShieldCheck size={13} /> {copy.camera.deviceNote}</p>
				</aside>
			</div>
		</section>
	{:else if stage === 'review'}
		<section class="workspace review-workspace">
			<div class="workspace-title">
				<p class="eyebrow"><span></span> {copy.review.eyebrow}</p>
				<h2>{copy.review.title}</h2>
				<p>{copy.review.intro}</p>
			</div>
			<div class="review-card">
				<img src={captureUrl} alt={copy.review.imageAlt} />
				<div class="review-copy">
					<div class="review-check">
						<Check size={20} />
						<div>
							<strong>{copy.review.complete}</strong><small>{copy.review.privacy}</small>
						</div>
					</div>
					<ul>
						{#each copy.review.checks as item (item)}<li>{item}</li>{/each}
					</ul>
					{#if analysisError}<div class="error-box">
							<CircleAlert size={18} /><span>{analysisError}</span>
						</div>{/if}
					<div class="review-actions">
						<button class="secondary-button" onclick={retake}
							><RefreshCw size={17} /> {copy.review.retake}</button
						><button class="primary-button" onclick={analyze}
							><ScanFace size={18} /> {copy.review.build} <ArrowRight size={17} /></button
						>
					</div>
				</div>
			</div>
		</section>
	{:else if stage === 'analyzing'}
		<section class="analyzing-screen">
			<div class="report-loader"><ScanFace size={34} /></div>
			<p class="eyebrow"><span></span> {copy.analyzing.eyebrow}</p>
			<h2>{copy.analyzing.title}</h2>
			<p>
				{copy.analyzing.body}<br />{copy.analyzing.timing}
			</p>
			<div class="progress-track"><i></i></div>
			<div class="analysis-steps">
				<span class="done"><Check size={15} /> {copy.analyzing.prepared}</span><span class="active"
					><ScanFace size={15} /> {copy.analyzing.appearance}</span
				><span>{copy.analyzing.actions}</span>
			</div>
		</section>
	{:else if stage === 'result' && result}
		<section class="workspace result-workspace">
			<div class="result-heading">
				<div>
					<p class="eyebrow"><span></span> {copy.report.eyebrow}</p>
					<h2>
						{copy.report.title}<br /><em>{copy.report.titleAccent}</em>
					</h2>
					<p>{localizedSummary}</p>
				</div>
				<div class="report-badges">
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
							<div><i style={`width:${item.score}%`}></i></div>
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
				</article>
			</div>
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
				<button class="secondary-button" onclick={startOver}
					><X size={17} /> {copy.report.startOver}</button
				><button class="primary-button" onclick={improve}
					><RefreshCw size={18} /> {copy.report.recapture} <ArrowRight size={17} /></button
				>
			</div>
		</section>
	{:else if stage === 'comparison' && result && previousCapture}
		<section class="workspace comparison-workspace">
			<div class="workspace-title">
				<p class="eyebrow"><span></span> {copy.comparison.eyebrow}</p>
				<h2>{copy.comparison.title} <em>{copy.comparison.titleAccent}</em></h2>
				<p>{copy.comparison.intro}</p>
			</div>
			<div class="comparison-stage" style={`--position:${comparisonPosition}%`}>
				<img
					class="after-image"
					src={result.lightingImageUrl || captureUrl}
					alt={copy.comparison.afterAlt}
				/>
				<div class="before-layer">
					<img src={previousCapture.image} alt={copy.comparison.beforeAlt} />
				</div>
				<div class="comparison-divider"><span><ArrowRight size={17} /></span></div>
				<div class="comparison-tag before-tag">
					{copy.comparison.before} · {previousCapture.result.overallScore}
				</div>
				<div class="comparison-tag after-tag">{copy.comparison.after} · {result.overallScore}</div>
				<input
					aria-label={copy.comparison.compareAria}
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
				<button class="secondary-button" onclick={startOver}>{copy.comparison.newReport}</button
				><button class="primary-button" onclick={() => startExperience(true)}
					><RefreshCw size={18} /> {copy.comparison.captureAgain}</button
				>
			</div>
		</section>
	{/if}
</main>

<input
	bind:this={fileInput}
	class="visually-hidden"
	type="file"
	accept="image/jpeg,image/png"
	onchange={selectFile}
/>

<footer>
	<span>Presence</span>
	<p>{copy.footer.disclaimer}</p>
	<small>{copy.footer.source}</small>
</footer>

<style>
	:global(:root) {
		--ink: #20201f;
		--muted: #706f69;
		--cream: #f7f5ef;
		--line: #dedbd1;
		--blue: #446e83;
		--blue-dark: #31596d;
		--sage: #cbd6cb;
		--paper: #fffefa;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		color: var(--ink);
		background: var(--cream);
	}
	:global(button),
	:global(input) {
		font: inherit;
	}
	:global(button) {
		color: inherit;
	}
	:global(em) {
		font-family: Georgia, 'Times New Roman', serif;
		font-weight: 400;
		color: var(--blue);
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
	.brand-mark {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: white;
		background: var(--blue);
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
	}
	.language-switch {
		display: inline-flex;
		align-items: center;
		padding: 3px;
		border: 1px solid var(--line);
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.46);
	}
	.language-switch button {
		height: 28px;
		padding: 0 9px;
		border: 0;
		border-radius: 3px;
		background: transparent;
		color: #8b8982;
		cursor: pointer;
		font-size: 9px;
		font-weight: 750;
		letter-spacing: 0.04em;
	}
	.language-switch button.active {
		background: #fff;
		color: var(--ink);
		box-shadow: 0 1px 4px rgba(44, 46, 42, 0.09);
	}
	.steps {
		display: flex;
		align-items: center;
	}
	.steps span {
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
	.steps span.active {
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
		min-height: 660px;
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
	.hero-description {
		margin: 28px 0 0;
		color: var(--muted);
		font-size: 16px;
		line-height: 1.8;
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
		transition: 0.2s ease;
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
		font-size: 11px;
		font-weight: 750;
		letter-spacing: 0.02em;
	}
	.preview-toolbar small {
		color: #728078;
		font-size: 9px;
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
		font-size: 9px;
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
		font-size: 9px;
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
		font-size: 9px;
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
		font-size: 12px;
	}
	.how-it-works article small {
		font-size: 10px;
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
		font-size: 9px;
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
		font-size: 12px;
		margin: 2px 0 5px;
	}
	.quality-item small {
		display: block;
		color: #97948c;
		font-size: 9px;
		line-height: 1.4;
	}
	.quality-item em {
		font-family: inherit;
		font-style: normal;
		color: #8f8c84;
		font-size: 9px;
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
		font-size: 9px;
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
		font-size: 8px;
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
		font-size: 10px;
		margin-top: 5px;
	}
	.review-copy ul {
		padding: 17px 0 17px 18px;
		margin: 0;
		color: #66655f;
		font-size: 11px;
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
		font-size: 10px;
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
		font-size: 9px;
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
	@keyframes progress {
		0% {
			transform: translateX(-110%);
		}
		60%,
		100% {
			transform: translateX(280%);
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
	.source-badge {
		display: inline-flex;
		align-items: center;
		font-size: 8px;
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
		font-size: 8px;
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
		font-size: 8px;
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
		font-size: 9px;
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
		font-size: 10px;
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
		font-size: 9px;
		color: #85827b;
		margin: 5px 0;
	}
	.tone-card small {
		font-size: 8px;
		color: #aaa69d;
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
		font-size: 9px;
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
		font-size: 9px;
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
		font-size: 9px;
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
		font-size: 7px;
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
		font-size: 9px;
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
	footer {
		min-height: 90px;
		border-top: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 25px;
		color: #98958d;
		font-size: 9px;
		padding: 22px 30px;
	}
	footer span {
		font:
			600 12px Georgia,
			serif;
		color: #66645f;
	}
	footer p {
		padding: 0 25px;
		border-left: 1px solid var(--line);
		border-right: 1px solid var(--line);
	}
	footer small {
		font-size: 8px;
		letter-spacing: 0.1em;
	}
	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
			gap: 25px;
			padding-top: 48px;
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
		.privacy-note span {
			display: none;
		}
		.header-actions {
			gap: 10px;
		}
		.language-switch button {
			padding: 0 7px;
		}
		.site-header.compact .brand > span:last-child {
			display: none;
		}
		.hero {
			padding: 45px 20px;
		}
		.hero h1 {
			font-size: 46px;
		}
		.hero-description br {
			display: none;
		}
		.hero-actions {
			align-items: stretch;
			flex-direction: column;
			gap: 8px;
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
		footer {
			flex-wrap: wrap;
			gap: 10px;
		}
		footer p {
			order: 3;
			width: 100%;
			border: 0;
			text-align: center;
			margin: 0;
		}
		.steps i {
			width: 25px;
		}
	}
</style>
