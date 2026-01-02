import { z } from 'zod';

export const CreateProjectSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.string().optional().default('other')
});

export const UpdateProjectSchema = z.object({
    id: z.string().uuid(),
    data: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        // Add other fields as per Project type
    })
});

export const CreateSessionSchema = z.object({
    projectId: z.string().uuid()
});

export const UpdateSessionSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    data: z.object({
        title: z.string().optional(),
        date: z.string().optional(),
        // Add other session fields if needed
    })
});

export const DeleteSessionSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid()
});

export const AddInputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    type: z.enum(['text', 'image', 'voice', 'pdf']),
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'), // or empty if image? logic in action handles this
    imageData: z.string().optional(),
    isAssignment: z.boolean().optional()
});

export const DeleteInputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    inputId: z.string().uuid()
});

// Skills
export const RunSessionSkillSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    skillId: z.string(), // e.g., 'analyze', 'summarize', 'ppt', 'pack'
    options: z.any().optional()
});

export const RunProjectSkillSchema = z.object({
    projectId: z.string().uuid(),
    skillId: z.string(),
    options: z.any().optional()
});

export const AnalyzeInputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    inputId: z.string().uuid()
});

export const RefineTextSchema = z.object({
    text: z.string()
});

// Templates
export const CreateTemplateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required')
});

export const DeleteTemplateSchema = z.object({
    id: z.string().uuid()
});

export const DeleteProjectOutputSchema = z.object({
    projectId: z.string().uuid(),
    outputId: z.string().uuid()
});

export const DeleteSessionOutputSchema = z.object({
    projectId: z.string().uuid(),
    sessionId: z.string().uuid(),
    outputId: z.string().uuid()
});
