import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Enable UUID extension
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

        // 1. Projects
        await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL CHECK (type IN ('classic', 'management', 'finance', 'other', 'tech')),
        variant VARCHAR(50) DEFAULT 'default',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
        total_sessions_planned INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        user_id UUID
      );
    `;

        // Index for projects
        await sql`CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);`;

        // 2. Sessions
        await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        session_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
        date DATE,
        tasks JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(project_id, session_number)
      );
    `;

        await sql`CREATE INDEX IF NOT EXISTS idx_sessions_project_order ON sessions(project_id, session_number);`;

        // 3. Inputs
        await sql`
      CREATE TABLE IF NOT EXISTS inputs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'pdf', 'voice', 'image', 'discussion_log')),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        storage_path VARCHAR(500),
        metadata JSONB DEFAULT '{}'::jsonb,
        is_assignment BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

        await sql`CREATE INDEX IF NOT EXISTS idx_inputs_session ON inputs(session_id);`;

        // 3.5 Knowledge Items
        await sql`
      CREATE TABLE IF NOT EXISTS knowledge_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        source_input_id UUID NOT NULL REFERENCES inputs(id) ON DELETE CASCADE,
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('fact', 'insight', 'quote', 'image_analysis')),
        content TEXT NOT NULL,
        tags JSONB DEFAULT '[]'::jsonb,
        importance INTEGER DEFAULT 0 CHECK (importance BETWEEN 0 AND 5),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

        await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_project ON knowledge_items(project_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_knowledge_input ON knowledge_items(source_input_id);`;

        // 4. Outputs
        await sql`
      CREATE TABLE IF NOT EXISTS outputs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        scope_id UUID NOT NULL,
        scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('PROJECT', 'SESSION')),
        skill_id VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('report', 'presentation', 'json', 'deck', 'sns', 'summary', 'homework', 'analysis', 'document', 'pack')),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        configuration JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

        await sql`CREATE INDEX IF NOT EXISTS idx_outputs_scope ON outputs(scope_id, scope_type);`;

        // 5. Instruction Templates
        await sql`
      CREATE TABLE IF NOT EXISTS instruction_templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

        return NextResponse.json({ message: 'Database setup detailed successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
