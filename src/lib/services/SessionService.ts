import { ISessionRepository } from '../repositories/interfaces';
import { PostgresSessionRepository } from '../repositories/postgres/PostgresSessionRepository';
import { Session, KnowledgeInput, InputType, SkillOutput, OutputType } from '../types';

export class SessionService {
    private sessionRepo: ISessionRepository;

    constructor() {
        this.sessionRepo = new PostgresSessionRepository();
    }

    async getSession(projectId: string, sessionId: string): Promise<Session | undefined> {
        return this.sessionRepo.getById(projectId, sessionId);
    }

    async createSession(projectId: string): Promise<Session> {
        const sessions = await this.sessionRepo.getByProjectId(projectId);
        const nextNumber = sessions.length + 1;

        const newSession: Session = {
            id: crypto.randomUUID(),
            projectId,
            sessionNumber: nextNumber,
            title: `Session ${nextNumber}`,
            inputs: [],
            outputs: []
        };

        return this.sessionRepo.create(newSession);
    }

    async deleteSession(projectId: string, sessionId: string): Promise<{ success: boolean; deleted: number }> {
        return this.sessionRepo.delete(projectId, sessionId);
    }

    async updateSession(projectId: string, sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
        return this.sessionRepo.update(projectId, sessionId, updates);
    }

    async addInput(projectId: string, sessionId: string, type: InputType, title: string, content: string, rawUrl?: string, isAssignment?: boolean): Promise<KnowledgeInput | undefined> {
        const newInput: KnowledgeInput = {
            id: crypto.randomUUID(),
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

    async deleteInput(projectId: string, sessionId: string, inputId: string): Promise<{ success: boolean; deleted: number }> {
        return this.sessionRepo.deleteInput(projectId, sessionId, inputId);
    }

    async addOutput(projectId: string, sessionId: string, skillId: string, type: OutputType, title: string, content: string | object): Promise<SkillOutput | undefined> {
        const newOutput: SkillOutput = {
            id: crypto.randomUUID(),
            sessionId,
            skillId,
            type,
            title,
            content,
            createdAt: new Date().toISOString()
        };
        return this.sessionRepo.addOutput(projectId, sessionId, newOutput);
    }

    async deleteOutput(projectId: string, sessionId: string, outputId: string): Promise<boolean> {
        return this.sessionRepo.deleteOutput(projectId, sessionId, outputId);
    }
}
