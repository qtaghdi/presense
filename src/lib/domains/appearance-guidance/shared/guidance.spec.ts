import { describe, expect, it } from 'vitest';
import { buildGuidance } from './guidance';
import type { SkinMetric } from '$lib/domains/analysis/shared/contracts';

const metrics: SkinMetric[] = [
	{ key: 'radiance', label: 'Radiance', score: 75, status: 'good' },
	{ key: 'texture', label: 'Skin texture', score: 54, status: 'priority' },
	{ key: 'dark_circle', label: 'Under-eye clarity', score: 61, status: 'attention' },
	{ key: 'redness', label: 'Tone balance', score: 80, status: 'good' }
];

describe('buildGuidance', () => {
	it('prioritizes the lowest readiness scores', () => {
		const result = buildGuidance(metrics, 0.58);
		expect(result.map((item) => item.id)).toEqual(['texture', 'dark_circle', 'radiance']);
		expect(result[0]).toMatchObject({ expectedImpact: 6, difficulty: 'easy' });
	});

	it('puts lighting first when the captured image is dark', () => {
		const withoutRadiance = metrics.filter((item) => item.key !== 'radiance');
		const result = buildGuidance(withoutRadiance, 0.25);
		expect(result[0].id).toBe('radiance');
	});
});
