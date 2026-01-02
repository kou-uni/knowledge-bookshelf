import { z } from 'zod';

export const CreateSessionSchema = z.object({
    projectId: z.string().uuid(),
});

export const UpdateSessionSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    data: z.object({
        title: z.string().optional(),
        date: z.string().optional(),
    }),
});

export const AddInputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    type: z.enum(['text', 'voice', 'file', 'photo']),
    title: z.string(),
    content: z.string().min(1, "Content is required"),
    imageData: z.string().optional(),
    isAssignment: z.boolean().optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export const DeleteSessionSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
});

export const DeleteInputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    inputId: z.string(),
});

export const DeleteSessionOutputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    outputId: z.string(),
});
