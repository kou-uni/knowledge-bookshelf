'use server';

import { revalidatePath } from 'next/cache';
import { ProjectService } from '@/lib/services/ProjectService';
import { SessionService } from '@/lib/services/SessionService';
import { TemplateService } from '@/lib/services/TemplateService';
import { InputType, Project, Session } from '@/lib/types';
import { summarizeSessionSkill } from '@/lib/skills/summarize';
import { generatePPTSkill } from '@/lib/skills/ppt';
import { analyzeSessionSkill } from '@/lib/skills/analyze';

import { KnowledgeService } from '@/lib/services/KnowledgeService';

const projectService = new ProjectService();
const sessionService = new SessionService();
const templateService = new TemplateService();
const knowledgeService = new KnowledgeService();

export async function initializeData() {
    await projectService.seedSampleData();
    revalidatePath('/');
}

export async function createNewProject(formData: FormData) {
    const title = formData.get('title') as string;
    const type = formData.get('type') as any;
    if (!title) return;
    await projectService.createProject(title, type || 'other');
    revalidatePath('/');
}

export async function updateProjectAction(id: string, data: Partial<Project>) {
    await projectService.updateProject(id, data);
    revalidatePath('/');
    revalidatePath(`/projects/${id}`);
}

export async function deleteProjectAction(projectId: string) {
    await projectService.deleteProject(projectId);
    revalidatePath('/');
}

// Session Management
export async function createSessionAction(projectId: string) {
    await sessionService.createSession(projectId);
    revalidatePath(`/projects/${projectId}`);
}

export async function deleteSessionAction(projectId: string, sessionId: string) {
    await sessionService.deleteSession(projectId, sessionId);
    revalidatePath(`/projects/${projectId}`);
}

export async function updateSessionDateAction(projectId: string, sessionId: string, date: string) {
    await sessionService.updateSession(projectId, sessionId, { date });
    revalidatePath(`/projects/${projectId}`);
}

export async function updateSessionAction(projectId: string, sessionId: string, data: Partial<Session>) {
    await sessionService.updateSession(projectId, sessionId, data);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
}

export async function addSessionInput(projectId: string, sessionId: string, formData: FormData) {
    let title = formData.get('title') as string;
    const content = formData.get('content') as string;
    let type = formData.get('type') as string;
    const imageData = formData.get('imageData') as string;
    const isAssignment = formData.get('isAssignment') === 'true'; // Checkbox value logic

    if (!title) {
        title = `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }

    if (type === 'photo') type = 'image';

    // Ensure we have content. If photo and no content provided (though frontend should provide it), fallback.
    if (!content) return;

    await sessionService.addInput(projectId, sessionId, type as InputType, title, content, imageData, isAssignment);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
}

export async function deleteSessionInputAction(projectId: string, sessionId: string, inputId: string) {
    await sessionService.deleteInput(projectId, sessionId, inputId);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
}

export async function runSessionSkill(projectId: string, sessionId: string, skillId: string) {
    const session = await sessionService.getSession(projectId, sessionId);
    if (!session) return { error: 'Session not found' };

    if (skillId === 'analyze') {
        try {
            const result = await analyzeSessionSkill({ session, inputs: session.inputs });
            await sessionService.addOutput(projectId, sessionId, skillId, result.type, result.title, result.content);
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
            await sessionService.addOutput(projectId, sessionId, skillId, result.type, result.title, result.content);
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
            await sessionService.addOutput(projectId, sessionId, skillId, result.type, result.title, result.content);
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

    await templateService.createTemplate(title, content);
    revalidatePath('/');
}

export async function deleteTemplateAction(id: string) {
    await templateService.deleteTemplate(id);
    revalidatePath('/');
}

export async function runProjectSkill(projectId: string, skillId: string) {
    const project = await projectService.getProject(projectId);
    if (!project) return { error: 'Project not found' };

    if (skillId === 'analyze') {
        try {
            // Aggregate all inputs
            const allInputs = project.sessions.flatMap(s => s.inputs);

            // Mock session context for the skill
            const mockSession = { title: `Project Analysis: ${project.title}` } as any;

            const result = await analyzeSessionSkill({ session: mockSession, inputs: allInputs });
            await projectService.addOutput(projectId, skillId, result.type, result.title, result.content);
            revalidatePath(`/projects/${projectId}`);
            return { success: true };
        } catch (e) {
            console.error(e);
            return { error: 'Failed to run project analysis' };
        }
    }
    return { error: 'Unknown skill' };
}

export async function analyzeInputAction(projectId: string, sessionId: string, inputId: string) {
    try {
        const items = await knowledgeService.analyzeInput(projectId, sessionId, inputId);
        revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
        return { success: true, items };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to extract knowledge' };
    }
}
