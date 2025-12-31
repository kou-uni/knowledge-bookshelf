// src/lib/types.ts

export type ProjectType = 'classic' | 'management' | 'finance' | 'other';

export type InputType = 'pdf' | 'voice' | 'text' | 'image' | 'discussion_log';

export type OutputType = 'report' | 'ppt' | 'sns' | 'summary' | 'homework' | 'analysis' | 'presentation' | 'document' | 'pack';

export type AudienceType = 'Executive' | 'Management' | 'Real' | 'Public';
export type StructureType = 'Strategic' | 'Technical' | 'Educational';

export interface StrategyContext {
    audience: AudienceType;
    structure: StructureType;
}

// 5. Input Specification
export interface KnowledgeInput {
    id: string;
    sessionId: string;
    type: InputType;
    title: string;
    content: string; // Text content (normalized)
    rawUrl?: string; // Path to file if applicable
    isAssignment?: boolean; // Flag for assignment/homework inputs
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
    metadata?: StrategyContext; // Store context choices
}

// 7. Knowledge Item (Wisdom Atom)
export interface KnowledgeItem {
    id: string;
    projectId: string; // Foreign Key equivalent
    sourceInputId: string; // ID of the input this was derived from
    type: 'fact' | 'insight' | 'quote' | 'image_analysis';
    content: string; // The atomic finding
    tags: string[];
    importance: number; // 0-5
    createdAt: string;
}

// 4. Concept Model - Session
export interface Session {
    id: string;
    projectId: string; // Foreign Key equivalent
    sessionNumber: number; // e.g., 1, 2, 3...
    title: string; // e.g., "Day 1: Introduction"
    date?: string;
    inputs: KnowledgeInput[];
    knowledgeItems?: KnowledgeItem[]; // New field
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
    outputs?: SkillOutput[]; // Project-level artifacts
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
