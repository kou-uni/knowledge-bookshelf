'use server';

import { createProject, seedSampleData, addInputToSession, getSession, addOutputToSession, createSession, deleteSession } from '@/lib/store';
import { revalidatePath } from 'next/cache';
import { InputType } from '@/lib/types';
import { summarizeSessionSkill } from '@/lib/skills/summarize';
import { generatePPTSkill } from '@/lib/skills/ppt';
import { analyzeSessionSkill } from '@/lib/skills/analyze';

export async function initializeData() {
    await seedSampleData();
    revalidatePath('/');
}

export async function createNewProject(formData: FormData) {
    const title = formData.get('title') as string;
    const type = formData.get('type') as any;
    if (!title) return;
    await createProject(title, type || 'other');
    revalidatePath('/');
}

export async function deleteProjectAction(projectId: string) {
    const { deleteProject } = await import('@/lib/store');
    await deleteProject(projectId);
    revalidatePath('/');
}

// Session Management
export async function createSessionAction(projectId: string) {
    await createSession(projectId);
    revalidatePath(`/projects/${projectId}`);
}

export async function deleteSessionAction(projectId: string, sessionId: string) {
    await deleteSession(projectId, sessionId);
    revalidatePath(`/projects/${projectId}`);
}

export async function updateSessionDateAction(projectId: string, sessionId: string, date: string) {
    // Dynamic import to avoid circular dep if needed, but here simple import work
    const { updateSession } = await import('@/lib/store');
    await updateSession(projectId, sessionId, { date });
    revalidatePath(`/projects/${projectId}`);
}

export async function addSessionInput(projectId: string, sessionId: string, formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const type = formData.get('type') as InputType || 'text';

    if (!title || !content) return;

    await addInputToSession(projectId, sessionId, type, title, content);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
}

export async function deleteSessionInputAction(projectId: string, sessionId: string, inputId: string) {
    const { deleteInputFromSession } = await import('@/lib/store');
    await deleteInputFromSession(projectId, sessionId, inputId);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
}

export async function runSessionSkill(projectId: string, sessionId: string, skillId: string) {
    const data = await getSession(projectId, sessionId);
    if (!data) return { error: 'Session not found' };

    const { session } = data;

    if (skillId === 'analyze') {
        try {
            const result = await analyzeSessionSkill({ session, inputs: session.inputs });
            await addOutputToSession(projectId, sessionId, skillId, result.type, result.title, result.content);
            revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
            return { success: true };
        } catch (e) {
            console.error(e);
            return { error: 'Failed to run analyze skill' };
        }
    }

    if (skillId === 'summarize') {
        try {
            const result = await summarizeSessionSkill({ session, inputs: session.inputs });
            await addOutputToSession(projectId, sessionId, skillId, result.type, result.title, result.content);
            revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
            return { success: true };
        } catch (e) {
            console.error(e);
            return { error: 'Failed to run skill' };
        }
    }

    if (skillId === 'ppt') {
        try {
            const result = await generatePPTSkill({ session, inputs: session.inputs });
            await addOutputToSession(projectId, sessionId, skillId, result.type, result.title, result.content);
            revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
            return { success: true };
        } catch (e) {
            console.error(e);
            return { error: 'Failed to run PPT skill' };
        }
    }

    return { error: 'Unknown skill' };
}

// Templates
export async function createTemplateAction(formData: FormData) {
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    if (!title || !content) return;

    const { addTemplate } = await import('@/lib/store');
    await addTemplate(title, content);
    revalidatePath('/');
}

export async function deleteTemplateAction(id: string) {
    const { deleteTemplate } = await import('@/lib/store');
    await deleteTemplate(id);
    revalidatePath('/');
}
