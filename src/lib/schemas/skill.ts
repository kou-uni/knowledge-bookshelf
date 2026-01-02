import { z } from 'zod';

export const RunSessionSkillSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    skillId: z.string(),
    options: z.record(z.string(), z.any()).optional(),
});

export const RunProjectSkillSchema = z.object({
    projectId: z.string().uuid(),
    skillId: z.string(),
    options: z.record(z.string(), z.any()).optional(),
});

export const AnalyzeInputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    inputId: z.string(),
});

export const RefineTextSchema = z.object({
    text: z.string().min(1),
});
