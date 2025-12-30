import fs from 'fs/promises';
import path from 'path';
import { KnowledgeStore, Project, Session, KnowledgeInput, ProjectType, InputType, OutputType, SkillOutput, InstructionTemplate } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'knowledge-v1.json');

async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
        const initialStore: KnowledgeStore = { projects: [] };
        await fs.writeFile(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
    }
}

async function readStore(): Promise<KnowledgeStore> {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

async function writeStore(store: KnowledgeStore) {
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export async function getProjects(): Promise<Project[]> {
    const store = await readStore();
    return store.projects;
}

export async function getProject(id: string): Promise<Project | undefined> {
    const store = await readStore();
    return store.projects.find(p => p.id === id);
}

export async function getSession(projectId: string, sessionId: string): Promise<{ project: Project; session: Session } | undefined> {
    const store = await readStore();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const session = project.sessions.find(s => s.id === sessionId);
    if (!session) return undefined;

    return { project, session };
}

// --- Session Management ---

export async function createSession(projectId: string): Promise<Session | undefined> {
    const store = await readStore();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const nextNumber = project.sessions.length + 1;
    const newSession: Session = {
        id: Math.random().toString(36).substring(7),
        projectId,
        sessionNumber: nextNumber,
        title: `Session ${nextNumber}`,
        inputs: [],
        outputs: []
    };

    project.sessions.push(newSession);
    await writeStore(store);
    return newSession;
}

export async function updateSession(projectId: string, sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const store = await readStore();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const session = project.sessions.find(s => s.id === sessionId);
    if (!session) return undefined;

    Object.assign(session, updates);
    await writeStore(store);
    return session;
}

export async function deleteSession(projectId: string, sessionId: string): Promise<boolean> {
    const store = await readStore();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return false;

    const initialLength = project.sessions.length;
    project.sessions = project.sessions.filter(s => s.id !== sessionId);

    if (project.sessions.length !== initialLength) {
        // Re-number sessions to avoid gaps? 
        // For now, let's keep gaps or just simple delete. Re-numbering is better for "Session N".
        project.sessions.forEach((s, idx) => {
            s.sessionNumber = idx + 1;
            // Optional: Update title if it was default "Session N"
            if (s.title.startsWith('Session ')) {
                s.title = `Session ${idx + 1}`;
            }
        });

        await writeStore(store);
        return true;
    }
    return false;
}

// --- Inputs & Outputs ---

export async function addInputToSession(projectId: string, sessionId: string, type: InputType, title: string, content: string): Promise<KnowledgeInput | undefined> {
    const store = await readStore();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const session = project.sessions.find(s => s.id === sessionId);
    if (!session) return undefined;

    const newInput: KnowledgeInput = {
        id: Math.random().toString(36).substring(7),
        sessionId,
        type,
        title,
        content,
        createdAt: new Date().toISOString()
    };

    session.inputs.push(newInput);
    await writeStore(store);
    return newInput;
}

export async function deleteInputFromSession(projectId: string, sessionId: string, inputId: string): Promise<boolean> {
    const store = await readStore();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return false;

    const session = project.sessions.find(s => s.id === sessionId);
    if (!session) return false;

    session.inputs = session.inputs.filter(i => i.id !== inputId);
    await writeStore(store);
    return true;
}

export async function addOutputToSession(projectId: string, sessionId: string, skillId: string, type: OutputType, title: string, content: string | object): Promise<SkillOutput | undefined> {
    const store = await readStore();
    const project = store.projects.find(p => p.id === projectId);
    if (!project) return undefined;

    const session = project.sessions.find(s => s.id === sessionId);
    if (!session) return undefined;

    const newOutput: SkillOutput = {
        id: Math.random().toString(36).substring(7),
        sessionId,
        skillId,
        type,
        title,
        content,
        createdAt: new Date().toISOString()
    };

    session.outputs.push(newOutput);
    await writeStore(store);
    return newOutput;
}

export async function createProject(title: string, type: ProjectType, totalSessions: number = 10): Promise<Project> {
    const store = await readStore();
    const newProject: Project = {
        id: Math.random().toString(36).substring(7),
        title,
        type,
        totalSessions,
        sessions: [],
        createdAt: new Date().toISOString()
    };
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
    store.projects.unshift(newProject);
    await writeStore(store);
    return newProject;
}

export async function deleteProject(projectId: string): Promise<boolean> {
    const store = await readStore();
    const initialLength = store.projects.length;
    store.projects = store.projects.filter(p => p.id !== projectId);

    if (store.projects.length !== initialLength) {
        await writeStore(store);
        return true;
    }
    return false;
}

export async function seedSampleData() {
    const store = await readStore();
    if (store.projects.length > 0) return;
    await createProject('Management Fundamentals 2025', 'management', 5);
    await createProject('Classical Philosophy Seminar', 'classic', 3);
}

// --- Templates ---

export async function getTemplates(): Promise<InstructionTemplate[]> {
    const store = await readStore();
    return store.templates || [];
}

export async function addTemplate(title: string, content: string): Promise<InstructionTemplate> {
    const store = await readStore();
    if (!store.templates) store.templates = [];

    const newTemplate: InstructionTemplate = {
        id: Math.random().toString(36).substring(7),
        title,
        content,
        createdAt: new Date().toISOString()
    };

    store.templates.push(newTemplate);
    await writeStore(store);
    return newTemplate;
}

export async function deleteTemplate(id: string): Promise<boolean> {
    const store = await readStore();
    if (!store.templates) return false;

    const initialLen = store.templates.length;
    store.templates = store.templates.filter(t => t.id !== id);

    if (store.templates.length !== initialLen) {
        await writeStore(store);
        return true;
    }
    return false;
}
