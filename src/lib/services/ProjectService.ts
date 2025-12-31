import { IProjectRepository } from '../repositories/interfaces';
import { JsonProjectRepo } from '../repositories/json/JsonProjectRepo';
import { Project, ProjectType } from '../types';

export class ProjectService {
    private projectRepo: IProjectRepository;

    constructor() {
        // In a real app, this would be injected
        this.projectRepo = new JsonProjectRepo();
    }

    async getAllProjects(): Promise<Project[]> {
        return this.repo.getAll();
    }

    async getProject(id: string): Promise<Project | undefined> {
        return this.projectRepo.getById(id);
    }

    async createProject(title: string, type: ProjectType, totalSessions: number = 10): Promise<Project> {
        const newProject: Project = {
            id: Math.random().toString(36).substring(7),
            title,
            type,
            totalSessions,
            sessions: [], // Sessions will be populated
            createdAt: new Date().toISOString()
        };

        // Initialize empty sessions
        for (let i = 1; i <= totalSessions; i++) {
            newProject.sessions.push({
                id: Math.random().toString(36).substring(7),
                projectId: newProject.id,
                sessionNumber: i,
                title: `Session ${i}`,
                inputs: [],
                outputs: []
            });
        }

        return this.projectRepo.create(newProject);
    }

    async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
        return this.projectRepo.update(id, updates);
    }

    async deleteProject(id: string): Promise<boolean> {
        return this.projectRepo.delete(id);
    }

    async seedSampleData() {
        const projects = await this.getAllProjects();
        if (projects.length > 0) return;
        await this.createProject('Management Fundamentals 2025', 'management', 5);
        await this.createProject('Classical Philosophy Seminar', 'classic', 3);
    }

    async addOutput(projectId: string, skillId: string, type: any, title: string, content: string | object) {
        const project = await this.getProject(projectId);
        if (!project) throw new Error('Project not found');

        const newOutput: any = {
            id: Math.random().toString(36).substring(7),
            skillId,
            type,
            title,
            content,
            createdAt: new Date().toISOString()
        };

        const currentOutputs = project.outputs || [];
        await this.updateProject(projectId, {
            outputs: [newOutput, ...currentOutputs]
        });

        return newOutput;
    }
}
