import type { AnalysisResult } from '$lib/domains/analysis/shared/contracts';

const STORAGE_KEY = 'ai-presence:before-result';

export type StoredCapture = {
	image: string;
	result: AnalysisResult;
};

export function saveBeforeCapture(capture: StoredCapture) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(capture));
	} catch {
		// Storage can be unavailable in privacy mode. The current session still works.
	}
}

export function readBeforeCapture(): StoredCapture | null {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value ? (JSON.parse(value) as StoredCapture) : null;
	} catch {
		return null;
	}
}

export function clearBeforeCapture() {
	localStorage.removeItem(STORAGE_KEY);
}
