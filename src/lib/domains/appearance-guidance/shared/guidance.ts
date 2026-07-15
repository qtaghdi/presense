import type { AppearanceGuidance, SkinMetric } from '$lib/domains/analysis/shared/contracts';

const guidanceByMetric: Record<string, Omit<AppearanceGuidance, 'id'>> = {
	radiance: {
		title: 'Face a soft, natural light source',
		description:
			'Place a window or diffused light just behind your camera. Even light adds clarity and makes your expression feel more open.',
		impact: 'high',
		expectedImpact: 11,
		difficulty: 'easy'
	},
	texture: {
		title: 'Raise your camera slightly above eye level',
		description:
			'Keep the lens about an arm’s length away. A higher, more natural angle reduces distortion and creates a composed frame.',
		impact: 'medium',
		expectedImpact: 6,
		difficulty: 'easy'
	},
	redness: {
		title: 'Use one neutral light temperature',
		description:
			'Avoid mixing warm room light with cool screen light. One neutral source keeps your complexion balanced on camera.',
		impact: 'medium',
		expectedImpact: 4,
		difficulty: 'easy'
	},
	dark_circle: {
		title: 'Soften shadows below your eyes',
		description:
			'Bounce light upward with a pale desk surface or a second soft lamp. This helps your eyes appear more alert and engaged.',
		impact: 'high',
		expectedImpact: 7,
		difficulty: 'moderate'
	},
	pore: {
		title: 'Diffuse direct light',
		description:
			'Use a sheer curtain or bounce the light off a wall. Softer contrast keeps facial detail natural without looking filtered.',
		impact: 'low',
		expectedImpact: 5,
		difficulty: 'moderate'
	}
};

export function buildGuidance(metrics: SkinMetric[], brightness = 0.58): AppearanceGuidance[] {
	const ordered = [...metrics].sort((a, b) => a.score - b.score);
	const selected = ordered
		.map((metric) => ({ metric, guidance: guidanceByMetric[metric.key] }))
		.filter((item): item is { metric: SkinMetric; guidance: Omit<AppearanceGuidance, 'id'> } =>
			Boolean(item.guidance)
		)
		.slice(0, 3)
		.map(({ metric, guidance }) => ({ ...guidance, id: metric.key }));

	if (brightness < 0.42 && !selected.some((item) => item.id === 'radiance')) {
		selected.unshift({ ...guidanceByMetric.radiance, id: 'radiance' });
	}

	return selected.slice(0, 3);
}
