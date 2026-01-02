'use server';

import { revalidatePath } from 'next/cache';
import { getServices } from './utils';
import { summarizeSessionSkill } from '@/lib/skills/summarize';
import { generatePPTSkill } from '@/lib/skills/ppt';
import { analyzeSessionSkill } from '@/lib/skills/analyze';
import { generateNotebookLMPackSkill, generateProjectNotebookLMPackSkill } from '@/lib/skills/crystallize';
import { createSafeAction } from '@/lib/safe-action';
import {
    RunSessionSkillSchema,
    RunProjectSkillSchema,
    AnalyzeInputSchema,
    RefineTextSchema
} from '@/lib/schemas';

// --- Safe Actions ---

export const runSessionSkillSafe = createSafeAction(RunSessionSkillSchema, async (data) => {
    const { sessionService } = getServices();
    const session = await sessionService.getSession(data.projectId, data.sessionId);
    if (!session) throw new Error('Session not found');

    const { skillId, options } = data;

    if (skillId === 'analyze') {
        const result = await analyzeSessionSkill({ session, inputs: session.inputs });
        await sessionService.addOutput(data.projectId, data.sessionId, skillId, result.type, result.title, result.content);
        revalidatePath(`/projects/${data.projectId}/sessions/${data.sessionId}`);
        return { success: true };
    }

    if (skillId === 'summarize') {
        const result = await summarizeSessionSkill({ session, inputs: session.inputs });
        await sessionService.addOutput(data.projectId, data.sessionId, skillId, result.type, result.title, result.content);
        revalidatePath(`/projects/${data.projectId}/sessions/${data.sessionId}`);
        return { success: true };
    }

    if (skillId === 'ppt') {
        const result = await generatePPTSkill({ session, inputs: session.inputs });
        await sessionService.addOutput(data.projectId, data.sessionId, skillId, result.type, result.title, result.content);
        revalidatePath(`/projects/${data.projectId}/sessions/${data.sessionId}`);
        return { success: true };
    }

    if (skillId === 'pack') {
        const result = await generateNotebookLMPackSkill({ session, inputs: session.inputs, options });
        await sessionService.addOutput(data.projectId, data.sessionId, skillId, result.type as any, result.title || 'Knowledge Pack', result.content as string);
        revalidatePath(`/projects/${data.projectId}/sessions/${data.sessionId}`);
        return { success: true };
    }

    throw new Error('Unknown skill');
});

export const runProjectSkillSafe = createSafeAction(RunProjectSkillSchema, async (data) => {
    const { projectService } = getServices();
    const project = await projectService.getProject(data.projectId);
    if (!project) throw new Error('Project not found');

    const { skillId, options } = data;

    if (skillId === 'analyze') {
        const allInputs = project.sessions.flatMap(s => s.inputs);
        const mockSession = { title: `Project Analysis: ${project.title}` } as any;
        const result = await analyzeSessionSkill({ session: mockSession, inputs: allInputs });
        await projectService.addOutput(data.projectId, skillId, result.type, result.title, result.content);
        revalidatePath(`/projects/${data.projectId}`);
        return { success: true };
    }

    if (skillId === 'pack') {
        const allInputs = project.sessions.flatMap(s => s.inputs.map(i => ({
            ...i,
            sessionTitle: s.title
        })));
        const result = await generateProjectNotebookLMPackSkill({ project, inputs: allInputs, options });
        await projectService.addOutput(data.projectId, skillId, result.type as any, result.title || 'Knowledge Pack', result.content as string);
        revalidatePath(`/projects/${data.projectId}`);
        return { success: true };
    }

    throw new Error('Unknown skill');
});

export const analyzeInputSafe = createSafeAction(AnalyzeInputSchema, async ({ projectId, sessionId, inputId }) => {
    const { knowledgeService } = getServices();
    const items = await knowledgeService.analyzeInput(projectId, sessionId, inputId);
    revalidatePath(`/projects/${projectId}/sessions/${sessionId}`);
    return { items };
});

export const refineTextSafe = createSafeAction(RefineTextSchema, async ({ text }) => {
    const { runLLM } = await import('@/lib/skills/base');
    const systemPrompt = `You are a professional editor. Your task is to clean up the provided voice transcript.
    1. Remove filler words (e.g., "ah", "um", "uh", "like", "you know", "アー", "ウー", "えーと").
    2. Fix grammar and punctuation slightly for readability, but keep the original meaning and tone.
    3. Do NOT summarize. Keep the content full. 
    4. Output ONLY the refined text.`;

    const refined = await runLLM(systemPrompt, text);
    return { text: refined };
});

// --- Legacy Wrappers ---

export async function runSessionSkill(projectId: string, sessionId: string, skillId: string, options?: any) {
    return await runSessionSkillSafe({ projectId, sessionId, skillId, options });
}

export async function runProjectSkill(projectId: string, skillId: string, options?: any) {
    return await runProjectSkillSafe({ projectId, skillId, options });
}

export async function analyzeInputAction(projectId: string, sessionId: string, inputId: string) {
    return await analyzeInputSafe({ projectId, sessionId, inputId });
}

export async function refineTextAction(text: string) {
    const result = await refineTextSafe({ text });
    if (!result.success) {
        return { text };
    }
    return { text: result.data?.text || text };
}
