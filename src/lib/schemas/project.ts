import { z } from 'zod';

export const CreateProjectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    type: z.enum(['classic', 'management', 'finance', 'other']).optional(),
});

export const UpdateProjectSchema = z.object({
    id: z.string().uuid(),
    data: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
    }),
});

export const DeleteProjectOutputSchema = z.object({
    projectId: z.string().uuid(),
    outputId: z.string(),
});
