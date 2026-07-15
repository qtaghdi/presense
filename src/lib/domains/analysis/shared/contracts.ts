import { z } from 'zod';

export const skinMetricSchema = z.object({
	key: z.string(),
	label: z.string(),
	score: z.number().min(0).max(100),
	status: z.enum(['good', 'attention', 'priority'])
});

export const appearanceGuidanceSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	impact: z.enum(['high', 'medium', 'low']),
	expectedImpact: z.number().int().min(1).max(20),
	difficulty: z.enum(['easy', 'moderate'])
});

export const analysisResultSchema = z.object({
	mode: z.enum(['live', 'demo']),
	createdAt: z.string(),
	summary: z.string(),
	overallScore: z.number().min(0).max(100),
	skinTone: z.object({
		hex: z.string().regex(/^#[0-9a-f]{6}$/i),
		label: z.string(),
		undertone: z.string()
	}),
	metrics: z.array(skinMetricSchema),
	guidance: z.array(appearanceGuidanceSchema),
	lightingImageUrl: z.string().url().nullable(),
	raw: z.record(z.string(), z.unknown()).optional()
});

export type SkinMetric = z.infer<typeof skinMetricSchema>;
export type AppearanceGuidance = z.infer<typeof appearanceGuidanceSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;
