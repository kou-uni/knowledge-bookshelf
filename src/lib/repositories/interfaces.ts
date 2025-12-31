import { Project, Session, InstructionTemplate, KnowledgeInput, SkillOutput } from '../types';

export interface IProjectRepository {
    getAll(): Promise<Project[]>;
    getById(id: string): Promise<Project | undefined>;
    create(project: Project): Promise<Project>;
    update(id: string, updates: Partial<Project>): Promise<Project | undefined>;
    delete(id: string): Promise<boolean>;
}

export interface ISessionRepository {
    getByProjectId(projectId: string): Promise<Session[]>;
    getById(projectId: string, sessionId: string): Promise<Session | undefined>;
    create(session: Session): Promise<Session>;
    update(projectId: string, sessionId: string, updates: Partial<Session>): Promise<Session | undefined>;
    delete(projectId: string, sessionId: string): Promise<boolean>;
    addInput(projectId: string, sessionId: string, input: KnowledgeInput): Promise<KnowledgeInput | undefined>;
    deleteInput(projectId: string, sessionId: string, inputId: string): Promise<boolean>;
    addOutput(projectId: string, sessionId: string, output: SkillOutput): Promise<SkillOutput | undefined>;
}

export interface ITemplateRepository {
    getAll(): Promise<InstructionTemplate[]>;
    create(template: InstructionTemplate): Promise<InstructionTemplate>;
    delete(id: string): Promise<boolean>;
}
