'use server';

import { revalidatePath } from 'next/cache';
import { Project } from '@/lib/types';
import { getServices } from './utils';
import { createSafeAction } from '@/lib/safe-action';
import { CreateProjectSchema, UpdateProjectSchema, DeleteProjectOutputSchema } from '@/lib/schemas';

export async function initializeData() {
    const { projectService } = getServices();
    await projectService.seedSampleData();
    revalidatePath('/');
}

// --- Safe Actions ---

export const createProjectSafe = createSafeAction(CreateProjectSchema, async (data) => {
    const { projectService } = getServices();
    const project = await projectService.createProject(data.title, data.type as any ?? 'classic');
    revalidatePath('/');
    return project;
});

export const updateProjectSafe = createSafeAction(UpdateProjectSchema, async ({ id, data }) => {
    const { projectService } = getServices();
    await projectService.updateProject(id, data as any);
    revalidatePath('/');
    revalidatePath(`/projects/${id}`);
    return { id };
});

// --- Legacy Wrappers (for backward compatibility) ---

export async function createNewProject(formData: FormData) {
    const title = formData.get('title') as string;
    const type = formData.get('type') as any;

    return await createProjectSafe({ title, type });
}

export async function updateProjectAction(id: string, data: Partial<Project>) {
    return await updateProjectSafe({ id, data });
}

export async function deleteProjectAction(projectId: string) {
    const { projectService } = getServices();
    await projectService.deleteProject(projectId);
    revalidatePath('/');
}

export const deleteProjectOutputSafe = createSafeAction(DeleteProjectOutputSchema, async ({ projectId, outputId }) => {
    const { projectService } = getServices();
    await projectService.deleteOutput(projectId, outputId);
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
});

export async function deleteProjectOutputAction(projectId: string, outputId: string) {
    return await deleteProjectOutputSafe({ projectId, outputId });
}
