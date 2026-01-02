'use server';

import { revalidatePath } from 'next/cache';
import { Session, InputType } from '@/lib/types';
import { getServices } from './utils';
import { createSafeAction } from '@/lib/safe-action';
import {
    CreateSessionSchema,
    UpdateSessionSchema,
    DeleteSessionSchema,
    AddInputSchema,
    DeleteInputSchema,
    DeleteSessionOutputSchema
} from '@/lib/schemas';

// --- Safe Actions ---

export const createSessionSafe = createSafeAction(CreateSessionSchema, async ({ projectId }) => {
    const { sessionService } = getServices();
    await sessionService.createSession(projectId);
    revalidatePath(`/projects/${projectId}`);
    return { projectId };
});

export const deleteSessionSafe = createSafeAction(DeleteSessionSchema, async ({ projectId, sessionId }) => {
    const { sessionService } = getServices();
    const result = await sessionService.deleteSession(projectId, sessionId);
    revalidatePath(`/projects/${projectId}`);
    return { sessionId, deletedCount: result.deleted };
});

export const updateSessionSafe = createSafeAction(UpdateSessionSchema, async ({ projectId, sessionId, data }) => {
    const { sessionService } = getServices();
    await sessionService.updateSession(projectId, sessionId, data as any);
    revalidatePath(`/projects/${projectId}`);
    // If updating date or title, specific path might need revalidation?
    // The original code revalidated project page.
    // updateSessionAction also revalidated session page.
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
    return { sessionId };
});

export const addInputSafe = createSafeAction(AddInputSchema, async (data) => {
    const { sessionService } = getServices();
    await sessionService.addInput(
        data.projectId,
        data.sessionId,
        data.type as InputType,
        data.title,
        data.content,
        data.imageData,
        data.isAssignment
    );
    revalidatePath(`/projects/${data.projectId}/sessions/${data.sessionId}`);
    return { sessionId: data.sessionId };
});

export const deleteInputSafe = createSafeAction(DeleteInputSchema, async ({ projectId, sessionId, inputId }) => {
    const { sessionService } = getServices();
    const result = await sessionService.deleteInput(projectId, sessionId, inputId);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
    return { inputId, deletedCount: result.deleted };
});

// --- Legacy Wrappers ---

export async function createSessionAction(projectId: string) {
    return await createSessionSafe({ projectId });
}

export async function deleteSessionAction(projectId: string, sessionId: string) {
    return await deleteSessionSafe({ projectId, sessionId });
}

export async function updateSessionDateAction(projectId: string, sessionId: string, date: string) {
    return await updateSessionSafe({ projectId, sessionId, data: { date } });
}

export async function updateSessionAction(projectId: string, sessionId: string, data: Partial<Session>) {
    return await updateSessionSafe({ projectId, sessionId, data });
}

export async function addSessionInput(projectId: string, sessionId: string, formData: FormData) {
    let title = formData.get('title') as string || '';
    const content = formData.get('content') as string || '';
    let type = formData.get('type') as string || '';
    const imageData = formData.get('imageData') as string || undefined;
    const isAssignment = formData.get('isAssignment') === 'true';

    // Normalization Logic (kept from original)
    if (!title) {
        title = `Untitled ${type?.charAt(0).toUpperCase() + type?.slice(1)}`;
    }
    type = (type || '').trim().toLowerCase();
    if (type === 'photo') type = 'image';

    // Ensure content (legacy check)
    if (!content) return { error: 'Content is missing' };

    return await addInputSafe({
        projectId,
        sessionId,
        type: type as any, // Schema will validate enum
        title,
        content,
        imageData,
        isAssignment
    });
}

export async function deleteSessionInputAction(projectId: string, sessionId: string, inputId: string) {
    return await deleteInputSafe({ projectId, sessionId, inputId });
}

export const deleteSessionOutputSafe = createSafeAction(DeleteSessionOutputSchema, async ({ projectId, sessionId, outputId }) => {
    const { sessionService } = getServices();
    await sessionService.deleteOutput(projectId, sessionId, outputId);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
    return { success: true };
});

export async function deleteSessionOutputAction(projectId: string, sessionId: string, outputId: string) {
    return await deleteSessionOutputSafe({ projectId, sessionId, outputId });
}
