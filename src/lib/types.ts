// src/lib/types.ts

export type ProjectType = 'classic' | 'management' | 'finance' | 'other';

export type InputType = 'pdf' | 'voice' | 'text' | 'image' | 'discussion_log';

export type OutputType = 'report' | 'ppt' | 'sns' | 'summary' | 'homework' | 'analysis';

// 5. Input Specification
export interface KnowledgeInput {
    id: string;
    sessionId: string;
    type: InputType;
    title: string;
    content: string; // Text content (normalized)
    rawUrl?: string; // Path to file if applicable
    createdAt: string;
}

// 6. Skill Output Specification
export interface SkillOutput {
    id: string;
    sessionId: string;
    skillId: string; // e.g., 'skill-01-summary'
    type: OutputType;
    title: string;
    content: string | object; // Markdown text, JSON structure, or Base64
    createdAt: string;
}

// 4. Concept Model - Session
export interface Session {
    id: string;
    projectId: string;
    sessionNumber: number; // e.g., 1, 2, 3...
    title: string; // e.g., "Day 1: Introduction"
    date?: string;
    inputs: KnowledgeInput[];
    outputs: SkillOutput[];
    // Task boxes
    preTask?: string;
    postTask?: string;
}

// 4. Concept Model - Project
export interface Project {
    id: string;
    title: string;
    type: ProjectType;
    description?: string;
    totalSessions?: number;
    sessions: Session[];
    createdAt: string;
}

export interface InstructionTemplate {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

// Root state for the JSON store
export interface KnowledgeStore {
    projects: Project[];
    templates?: InstructionTemplate[];
}


