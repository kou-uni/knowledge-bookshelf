import { ISessionRepository } from '../interfaces';
import { Session, KnowledgeInput, SkillOutput } from '../../types';
import { JsonAdapter } from '../../db/JsonAdapter';

export class JsonSessionRepository implements ISessionRepository {
    private adapter: JsonAdapter;

    constructor() {
        this.adapter = JsonAdapter.getInstance();
    }

    async getByProjectId(projectId: string): Promise<Session[]> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === projectId);
        return project ? project.sessions : [];
    }

    async getById(projectId: string, sessionId: string): Promise<Session | undefined> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === projectId);
        return project?.sessions.find(s => s.id === sessionId);
    }

    async create(session: Session): Promise<Session> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === session.projectId);
        if (!project) throw new Error('Project not found');

        project.sessions.push(session);
        await this.adapter.writeStore(store);
        return session;
    }

    async update(projectId: string, sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === projectId);
        if (!project) return undefined;

        const session = project.sessions.find(s => s.id === sessionId);
        if (!session) return undefined;

        Object.assign(session, updates);
        await this.adapter.writeStore(store);
        return session;
    }

    async delete(projectId: string, sessionId: string): Promise<boolean> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === projectId);
        if (!project) return false;

        const initialLength = project.sessions.length;
        project.sessions = project.sessions.filter(s => s.id !== sessionId);

        if (project.sessions.length !== initialLength) {
            // Optional: Renumber logic could go here or in Service
            project.sessions.forEach((s, idx) => {
                s.sessionNumber = idx + 1;
                if (s.title.startsWith('Session ')) {
                    s.title = `Session ${idx + 1}`;
                }
            });
            await this.adapter.writeStore(store);
            return true;
        }
        return false;
    }

    async addInput(projectId: string, sessionId: string, input: KnowledgeInput): Promise<KnowledgeInput | undefined> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === projectId);
        if (!project) return undefined;

        const session = project.sessions.find(s => s.id === sessionId);
        if (!session) return undefined;

        session.inputs.push(input);
        await this.adapter.writeStore(store);
        return input;
    }

    async deleteInput(projectId: string, sessionId: string, inputId: string): Promise<boolean> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === projectId);
        if (!project) return false;

        const session = project.sessions.find(s => s.id === sessionId);
        if (!session) return false;

        session.inputs = session.inputs.filter(i => i.id !== inputId);
        await this.adapter.writeStore(store);
        return true;
    }

    async addOutput(projectId: string, sessionId: string, output: SkillOutput): Promise<SkillOutput | undefined> {
        const store = await this.adapter.readStore();
        const project = store.projects.find(p => p.id === projectId);
        if (!project) return undefined;

        const session = project.sessions.find(s => s.id === sessionId);
        if (!session) return undefined;

        session.outputs.push(output);
        await this.adapter.writeStore(store);
        return output;
    }
}
