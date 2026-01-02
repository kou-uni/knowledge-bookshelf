'use server';

import { revalidatePath } from 'next/cache';
import { getServices } from './utils';
import { createSafeAction } from '@/lib/safe-action';
import { CreateTemplateSchema, DeleteTemplateSchema } from '@/lib/schemas';

// --- Safe Actions ---

export const createTemplateSafe = createSafeAction(CreateTemplateSchema, async (data) => {
    const { templateService } = getServices();
    await templateService.createTemplate(data.title, data.content);
    revalidatePath('/');
    return { success: true };
});

export const deleteTemplateSafe = createSafeAction(DeleteTemplateSchema, async ({ id }) => {
    const { templateService } = getServices();
    await templateService.deleteTemplate(id);
    revalidatePath('/');
    return { id };
});

// --- Legacy Wrappers ---

export async function createTemplateAction(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    const result = await createTemplateSafe({ title, content });

    if (!result.success) {
        console.error('createTemplateAction failed:', result.error);
    }
}

export async function deleteTemplateAction(id: string) {
    await deleteTemplateSafe({ id });
}
