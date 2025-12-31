/**
 * Knowledge Bookshelf - Database Types
 * Mirrors the structure of database_schema.sql
 */

export type ProjectType = 'classic' | 'management' | 'finance';
export type ProjectStatus = 'active' | 'archived' | 'deleted';

export interface ProjectDB {
    id: string; // UUID
    title: string;
    description: string | null;
    type: ProjectType;
    variant: string; // default: 'default'
    status: ProjectStatus;
    total_sessions_planned: number;
    created_at: string; // ISO Date String
    updated_at: string; // ISO Date String
    user_id: string | null; // UUID
    // Derived fields (not in DB table, but common in queries)
    session_count?: number;
}

export type SessionStatus = 'planned' | 'active' | 'completed';

export interface SessionDB {
    id: string; // UUID
    project_id: string; // UUID
    session_number: number;
    title: string;
    description: string | null;
    status: SessionStatus;
    date: string | null; // ISO Date "YYYY-MM-DD"
    tasks: {
        preTask?: string;
        postTask?: string;
        // Future extensibility
        [key: string]: any;
    };
    created_at: string;
}

export type InputType = 'text' | 'pdf' | 'voice' | 'image';

export interface InputDB {
    id: string; // UUID
    session_id: string; // UUID
    type: InputType;
    title: string;
    content: string | null; // Extracted text or image description
    storage_path: string | null; // Path to blob
    metadata: {
        filesize?: number;
        duration?: number; // seconds
        mimeType?: string;
        originalFilename?: string;
        [key: string]: any;
    };
    is_assignment: boolean;
    created_at: string;
}

export type KnowledgeItemType = 'fact' | 'insight' | 'quote' | 'image_analysis';

export interface KnowledgeItemDB {
    id: string; // UUID
    project_id: string; // UUID
    source_input_id: string; // UUID
    type: KnowledgeItemType;
    content: string; // The atomic finding
    tags: string[]; // JSONB array
    importance: number; // 0-5
    created_at: string;
}

export type OutputScopeType = 'PROJECT' | 'SESSION';
export type OutputType = 'report' | 'presentation' | 'json' | 'deck';

export interface OutputDB {
    id: string; // UUID
    scope_id: string; // UUID (ProjectID or SessionID)
    scope_type: OutputScopeType;
    skill_id: string; // e.g. 'skill-01'
    type: OutputType;
    title: string;
    content: string | null; // Markdown or JSON
    configuration: {
        audience?: string;
        structure?: string;
        [key: string]: any;
    };
    created_at: string;
}
