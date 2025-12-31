import { ISessionRepository } from '../repositories/interfaces';
import { JsonSessionRepository } from '../repositories/json/JsonSessionRepository';
import { Session, KnowledgeInput, InputType, SkillOutput, OutputType } from '../types';

export class SessionService {
    private sessionRepo: ISessionRepository;

    constructor() {
        this.sessionRepo = new JsonSessionRepository();
    }

    async getSession(projectId: string, sessionId: string): Promise<Session | undefined> {
        return this.sessionRepo.getById(projectId, sessionId);
    }

    async createSession(projectId: string): Promise<Session> {
        const sessions = await this.sessionRepo.getByProjectId(projectId);
        const nextNumber = sessions.length + 1;

        const newSession: Session = {
            id: Math.random().toString(36).substring(7),
            projectId,
            sessionNumber: nextNumber,
            title: `Session ${nextNumber}`,
            inputs: [],
            outputs: []
        };

        return this.sessionRepo.create(newSession);
    }

    async deleteSession(projectId: string, sessionId: string): Promise<boolean> {
        return this.sessionRepo.delete(projectId, sessionId);
    }

    async updateSession(projectId: string, sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
        return this.sessionRepo.update(projectId, sessionId, updates);
    }

    async addInput(projectId: string, sessionId: string, type: InputType, title: string, content: string, rawUrl?: string, isAssignment?: boolean): Promise<KnowledgeInput | undefined> {
        const newInput: KnowledgeInput = {
            id: Math.random().toString(36).substring(7),
            sessionId,
            type,
            title,
            content,
            rawUrl,
            isAssignment,
            createdAt: new Date().toISOString()
        };
        return this.sessionRepo.addInput(projectId, sessionId, newInput);
    }

    async deleteInput(projectId: string, sessionId: string, inputId: string): Promise<boolean> {
        return this.sessionRepo.deleteInput(projectId, sessionId, inputId);
    }

    async addOutput(projectId: string, sessionId: string, skillId: string, type: OutputType, title: string, content: string | object): Promise<SkillOutput | undefined> {
        const newOutput: SkillOutput = {
            id: Math.random().toString(36).substring(7),
            sessionId,
            skillId,
            type,
            title,
            content,
            createdAt: new Date().toISOString()
        };
        return this.sessionRepo.addOutput(projectId, sessionId, newOutput);
    }
}
