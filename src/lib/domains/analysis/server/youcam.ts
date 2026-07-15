import { env } from '$env/dynamic/private';
import { buildGuidance } from '$lib/domains/appearance-guidance/shared/guidance';
import {
	analysisResultSchema,
	type AnalysisResult,
	type SkinMetric
} from '$lib/domains/analysis/shared/contracts';

const DEFAULT_API_BASE = 'https://yce-api-01.makeupar.com';
const POLL_INTERVAL_MS = 1_500;
const POLL_TIMEOUT_MS = 55_000;

type JsonObject = Record<string, unknown>;

type Feature = {
	version: 'v2.0' | 'v2.1';
	slug: string;
	payload: (fileId: string) => JsonObject;
};

const skinFeature: Feature = {
	version: 'v2.1',
	slug: 'skin-analysis',
	payload: (src_file_id) => ({
		src_file_id,
		dst_actions: ['radiance', 'texture', 'redness', 'dark_circle', 'pore'],
		miniserver_args: { enable_mask_overlay: false },
		format: 'json',
		pf_camera_kit: false
	})
};

const toneFeature: Feature = {
	version: 'v2.0',
	slug: 'skin-tone-analysis',
	payload: (src_file_id) => ({ src_file_id, face_angle_strictness_level: 'high' })
};

function asObject(value: unknown): JsonObject {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as JsonObject)
		: {};
}

function getData(value: unknown) {
	return asObject(asObject(value).data);
}

async function apiRequest(path: string, init: RequestInit = {}) {
	const apiKey = env.YOUCAM_API_KEY;
	if (!apiKey) throw new Error('The YouCam API key is not configured.');

	const response = await fetch(`${env.YOUCAM_API_BASE ?? DEFAULT_API_BASE}${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${apiKey}`,
			...(init.body ? { 'Content-Type': 'application/json' } : {}),
			...init.headers
		}
	});

	const body = (await response.json().catch(() => ({}))) as unknown;
	if (!response.ok) {
		const data = getData(body);
		throw new Error(String(data.error_message ?? data.error ?? `YouCam API ${response.status}`));
	}
	return body;
}

async function uploadForFeature(file: File, feature: Feature) {
	const metadata = await apiRequest(`/s2s/${feature.version}/file/${feature.slug}`, {
		method: 'POST',
		body: JSON.stringify({
			files: [
				{
					content_type: file.type,
					file_name: file.name || 'presence-capture.jpg',
					file_size: file.size
				}
			]
		})
	});

	const files = getData(metadata).files;
	const firstFile = Array.isArray(files) ? asObject(files[0]) : {};
	const requests = firstFile.requests;
	const uploadRequest = Array.isArray(requests) ? asObject(requests[0]) : asObject(requests);
	const uploadUrl = uploadRequest.url;
	const fileId = firstFile.file_id;

	if (typeof uploadUrl !== 'string' || typeof fileId !== 'string') {
		throw new Error('YouCam did not return a valid upload URL.');
	}

	const upload = await fetch(uploadUrl, {
		method: typeof uploadRequest.method === 'string' ? uploadRequest.method : 'PUT',
		headers: { 'Content-Type': file.type },
		body: file
	});
	if (!upload.ok) throw new Error(`The image upload failed. (${upload.status})`);

	return fileId;
}

async function pollTask(feature: Feature, taskId: string) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
		const response = await apiRequest(
			`/s2s/${feature.version}/task/${feature.slug}/${encodeURIComponent(taskId)}`
		);
		const data = getData(response);
		const status = data.task_status;
		if (status === 'success') return data.results;
		if (status === 'error') {
			throw new Error(
				String(data.error_message ?? data.error ?? 'YouCam could not analyze this image.')
			);
		}
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}
	throw new Error('The analysis is taking longer than expected. Please try again.');
}

async function runFeature(file: File, feature: Feature) {
	const fileId = await uploadForFeature(file, feature);
	const created = await apiRequest(`/s2s/${feature.version}/task/${feature.slug}`, {
		method: 'POST',
		body: JSON.stringify(feature.payload(fileId))
	});
	const taskId = getData(created).task_id;
	if (typeof taskId !== 'string') throw new Error('YouCam did not return a valid task ID.');
	return pollTask(feature, taskId);
}

function findNumber(value: unknown, aliases: string[]): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (Array.isArray(value)) {
		for (const item of value) {
			const found = findNumber(item, aliases);
			if (found !== undefined) return found;
		}
		return undefined;
	}
	const object = asObject(value);
	for (const [key, entry] of Object.entries(object)) {
		if (aliases.some((alias) => key.toLowerCase().includes(alias)) && typeof entry === 'number') {
			return entry;
		}
	}
	for (const entry of Object.values(object)) {
		const found = findNumber(entry, aliases);
		if (found !== undefined) return found;
	}
	return undefined;
}

function readinessScore(raw: number | undefined, fallback: number, inverse = true) {
	if (raw === undefined) return fallback;
	const normalized = raw <= 1 ? raw * 100 : raw;
	const score = inverse ? 100 - normalized : normalized;
	return Math.max(0, Math.min(100, Math.round(score)));
}

function metric(key: string, label: string, score: number): SkinMetric {
	return {
		key,
		label,
		score,
		status: score >= 75 ? 'good' : score >= 55 ? 'attention' : 'priority'
	};
}

function mapMetrics(results: unknown): SkinMetric[] {
	return [
		metric('radiance', 'Radiance', readinessScore(findNumber(results, ['radiance']), 72, false)),
		metric('texture', 'Skin texture', readinessScore(findNumber(results, ['texture']), 68)),
		metric('redness', 'Tone balance', readinessScore(findNumber(results, ['redness']), 74)),
		metric(
			'dark_circle',
			'Under-eye clarity',
			readinessScore(findNumber(results, ['dark_circle', 'darkcircle']), 63)
		),
		metric('pore', 'Camera clarity', readinessScore(findNumber(results, ['pore']), 77))
	];
}

function colorFromTone(results: unknown) {
	const color = asObject(asObject(results).color);
	const hex = typeof color.skin_color === 'string' ? color.skin_color : '#c89578';
	return {
		hex: /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#c89578',
		label: 'Natural medium',
		undertone: 'Neutral-warm'
	};
}

function findUrl(value: unknown): string | null {
	if (typeof value === 'string' && /^https?:\/\//.test(value)) return value;
	if (Array.isArray(value)) {
		for (const item of value) {
			const url = findUrl(item);
			if (url) return url;
		}
	}
	for (const [key, entry] of Object.entries(asObject(value))) {
		if (
			(key.includes('url') || key.includes('image')) &&
			typeof entry === 'string' &&
			/^https?:\/\//.test(entry)
		)
			return entry;
		const url = findUrl(entry);
		if (url) return url;
	}
	return null;
}

function lightingFeature(): Feature | null {
	const slug = env.YOUCAM_LIGHTING_FEATURE;
	if (!slug) return null;
	return { version: 'v2.0', slug, payload: (src_file_id) => ({ src_file_id }) };
}

export async function analyzeWithYouCam(file: File, brightness: number): Promise<AnalysisResult> {
	const optionalLighting = lightingFeature();
	const [skin, tone, lighting] = await Promise.all([
		runFeature(file, skinFeature),
		runFeature(file, toneFeature),
		optionalLighting ? runFeature(file, optionalLighting).catch(() => null) : Promise.resolve(null)
	]);

	const metrics = mapMetrics(skin);
	const overallScore = Math.round(
		metrics.reduce((total, item) => total + item.score, 0) / metrics.length
	);
	return analysisResultSchema.parse({
		mode: 'live',
		createdAt: new Date().toISOString(),
		summary:
			overallScore >= 75
				? 'You already make a clear, confident first impression.'
				: 'A few focused adjustments could make you appear even more confident.',
		overallScore,
		skinTone: colorFromTone(tone),
		metrics,
		guidance: buildGuidance(metrics, brightness),
		lightingImageUrl: findUrl(lighting)
	});
}

export function buildDemoAnalysis(file: File, brightness: number): AnalysisResult {
	const variation = file.size % 9;
	const lightScore = Math.round(
		Math.max(48, Math.min(92, 100 - Math.abs(brightness - 0.58) * 145))
	);
	const metrics = [
		metric('radiance', 'Radiance', lightScore),
		metric('texture', 'Skin texture', 69 + (variation % 4)),
		metric('redness', 'Tone balance', 76 - (variation % 5)),
		metric('dark_circle', 'Under-eye clarity', 62 + (variation % 6)),
		metric('pore', 'Camera clarity', 78 - (variation % 3))
	];
	const overallScore = Math.round(
		metrics.reduce((total, item) => total + item.score, 0) / metrics.length
	);

	return analysisResultSchema.parse({
		mode: 'demo',
		createdAt: new Date().toISOString(),
		summary:
			'You’re almost ready. A few small changes to light and framing could make your presence feel noticeably stronger.',
		overallScore,
		skinTone: { hex: '#c89578', label: 'Natural medium', undertone: 'Neutral-warm' },
		metrics,
		guidance: buildGuidance(metrics, brightness),
		lightingImageUrl: null
	});
}

export function hasYouCamCredentials() {
	return Boolean(env.YOUCAM_API_KEY);
}
