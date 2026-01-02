import { sql } from '@vercel/postgres';
import { ISessionRepository } from '../interfaces';
import { Session, KnowledgeInput, SkillOutput, KnowledgeItem } from '../../types';

export class PostgresSessionRepository implements ISessionRepository {

    async getByProjectId(projectId: string): Promise<Session[]> {
        // 1. Fetch Sessions
        const { rows: sessionRows } = await sql`
            SELECT * FROM sessions 
            WHERE project_id = ${projectId} AND status != 'deleted'
            ORDER BY session_number ASC
        `;

        if (sessionRows.length === 0) return [];

        const sessionIds = sessionRows.map(s => s.id);

        // 2. Fetch Inputs
        // Use standard "ANY" for array param in Postgres
        const { rows: inputRows } = await sql`
            SELECT * FROM inputs WHERE session_id = ANY(${sessionIds as any})
        `;

        // 3. Fetch Outputs
        const { rows: outputRows } = await sql`
            SELECT * FROM outputs 
            WHERE scope_type = 'SESSION' AND scope_id = ANY(${sessionIds as any})
        `;

        // 4. Fetch KnowledgeItems
        const { rows: kItemRows } = await sql`
            SELECT * FROM knowledge_items WHERE session_id = ANY(${sessionIds as any})
        `;

        // Reassemble
        return sessionRows.map(sRow => {
            const session = this.mapRowToSession(sRow);
            session.inputs = inputRows
                .filter(i => i.session_id === sRow.id)
                .map(this.mapRowToInput);

            session.outputs = outputRows
                .filter(o => o.scope_id === sRow.id)
                .map(this.mapRowToOutput);

            session.knowledgeItems = kItemRows
                .filter(k => k.session_id === sRow.id)
                .map(this.mapRowToKnowledgeItem);

            return session;
        });
    }

    async getById(projectId: string, sessionId: string): Promise<Session | undefined> {
        const { rows } = await sql`
            SELECT * FROM sessions WHERE id = ${sessionId} AND project_id = ${projectId}
        `;
        if (rows.length === 0) return undefined;

        const sessionRow = rows[0];
        const session = this.mapRowToSession(sessionRow);

        // Fetch children
        const { rows: inputs } = await sql`SELECT * FROM inputs WHERE session_id = ${sessionId}`;
        session.inputs = inputs.map(this.mapRowToInput);

        const { rows: outputs } = await sql`SELECT * FROM outputs WHERE scope_type = 'SESSION' AND scope_id = ${sessionId}`;
        session.outputs = outputs.map(this.mapRowToOutput);

        const { rows: kItems } = await sql`SELECT * FROM knowledge_items WHERE session_id = ${sessionId}`;
        session.knowledgeItems = kItems.map(this.mapRowToKnowledgeItem);

        return session;
    }

    async create(session: Session): Promise<Session> {
        const { rows } = await sql`
            INSERT INTO sessions (id, project_id, session_number, title, date, tasks, status)
            VALUES (${session.id}, ${session.projectId}, ${session.sessionNumber}, ${session.title}, ${session.date || null}, ${JSON.stringify({ preTask: session.preTask, postTask: session.postTask }) as any}, 'planned')
            RETURNING *
        `;
        return this.mapRowToSession(rows[0]);
    }

    async update(projectId: string, sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
        // Handle KnowledgeItems "Full Replace" logic if present
        if (updates.knowledgeItems) {
            // Transactional-ish approach
            // 1. Delete all for this session
            await sql`DELETE FROM knowledge_items WHERE session_id = ${sessionId}`;

            // 2. Insert new ones (Parallelize to prevent timeout)
            await Promise.all(updates.knowledgeItems.map(item =>
                sql`
                    INSERT INTO knowledge_items (id, project_id, session_id, source_input_id, type, content, tags, importance, created_at)
                    VALUES (${item.id}, ${item.projectId}, ${sessionId}, ${item.sourceInputId}, ${item.type}, ${item.content}, ${JSON.stringify(item.tags) as any}, ${item.importance}, ${item.createdAt})
                `
            ));
        }

        if (updates.title || updates.date || updates.preTask || updates.postTask) {
            const tasks = {
                preTask: updates.preTask, // might be undefined, handle properly?
                postTask: updates.postTask
            };

            // Simple update for fields if they exist
            if (updates.title) await sql`UPDATE sessions SET title = ${updates.title} WHERE id = ${sessionId}`;
            if (updates.date) await sql`UPDATE sessions SET date = ${updates.date || null} WHERE id = ${sessionId}`;
            // For tasks, we need to merge? Or just update if provided? 
            // The JSON storage merged. 
            // Let's assume tasks update is partial? Complex.
            // For now, simpler fields are priority.
        }

        return this.getById(projectId, sessionId);
    }

    async delete(projectId: string, sessionId: string): Promise<{ success: boolean; deleted: number }> {
        console.log(`[Repo] Deleting session ${sessionId} for project ${projectId}`);
        // Manually cascade delete to ensure safety regardless of DB constraints
        const resultK = await sql`DELETE FROM knowledge_items WHERE session_id = ${sessionId}`;
        console.log(`[Repo] Deleted ${resultK.rowCount} knowledge items`);
        const resultO = await sql`DELETE FROM outputs WHERE scope_type = 'SESSION' AND scope_id = ${sessionId}`;
        console.log(`[Repo] Deleted ${resultO.rowCount} outputs`);
        const resultI = await sql`DELETE FROM inputs WHERE session_id = ${sessionId}`;
        console.log(`[Repo] Deleted ${resultI.rowCount} inputs`);
        const resultS = await sql`DELETE FROM sessions WHERE id = ${sessionId}`;
        console.log(`[Repo] Deleted ${resultS.rowCount} sessions`);
        return { success: true, deleted: resultS.rowCount || 0 };
    }

    async addInput(projectId: string, sessionId: string, input: KnowledgeInput): Promise<KnowledgeInput | undefined> {
        await sql`
            INSERT INTO inputs (id, session_id, type, title, content, storage_path, is_assignment, created_at)
            VALUES (${input.id}, ${sessionId}, ${input.type}, ${input.title}, ${input.content || ''}, ${input.rawUrl || null}, ${input.isAssignment || false}, ${input.createdAt})
        `;
        return input;
    }

    async deleteInput(projectId: string, sessionId: string, inputId: string): Promise<{ success: boolean; deleted: number }> {
        console.log(`[Repo] Deleting input ${inputId} for session ${sessionId}`);
        const resultK = await sql`DELETE FROM knowledge_items WHERE source_input_id = ${inputId}`;
        console.log(`[Repo] Deleted ${resultK.rowCount} knowledge items`);
        const resultI = await sql`DELETE FROM inputs WHERE id = ${inputId}`;
        console.log(`[Repo] Deleted ${resultI.rowCount} inputs`);
        return { success: true, deleted: resultI.rowCount || 0 };
    }

    async addOutput(projectId: string, sessionId: string, output: SkillOutput): Promise<SkillOutput | undefined> {
        // For singleton skills (like analysis), overwrite. For artifacts (packs), append.
        const singletonSkills = ['analyze', 'summarize', 'refine'];
        if (singletonSkills.includes(output.skillId)) {
            await sql`DELETE FROM outputs WHERE scope_id = ${sessionId} AND skill_id = ${output.skillId}`;
        }

        await sql`
            INSERT INTO outputs (id, scope_id, scope_type, skill_id, type, title, content, configuration, created_at)
            VALUES (${output.id}, ${sessionId}, 'SESSION', ${output.skillId}, ${output.type}, ${output.title}, ${JSON.stringify(output.content) as any}, ${JSON.stringify(output.metadata || {}) as any}, ${output.createdAt})
        `;
        return output;
    }

    async deleteOutput(projectId: string, sessionId: string, outputId: string): Promise<boolean> {
        await sql`DELETE FROM outputs WHERE scope_type = 'SESSION' AND scope_id = ${sessionId} AND id = ${outputId}`;
        return true;
    }

    // --- Mappers ---

    private mapRowToSession(row: any): Session {
        return {
            id: row.id,
            projectId: row.project_id,
            sessionNumber: row.session_number,
            title: row.title,
            date: row.date ? (row.date.toISOString ? row.date.toISOString().split('T')[0] : row.date) : undefined,
            inputs: [],
            outputs: [],
            knowledgeItems: [],
            preTask: row.tasks?.preTask,
            postTask: row.tasks?.postTask
        };
    }

    private mapRowToInput(row: any): KnowledgeInput {
        return {
            id: row.id,
            sessionId: row.session_id,
            type: row.type,
            title: row.title,
            content: row.content,
            isAssignment: row.is_assignment,
            createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
            rawUrl: row.storage_path // Mapping back if strictly needed
        };
    }

    private mapRowToOutput(row: any): SkillOutput {
        return {
            id: row.id,
            skillId: row.skill_id,
            sessionId: row.scope_id,
            type: row.type,
            title: row.title,
            content: row.content, // content column is TEXT. If JSON string, might need parsing if type expects object? 
            // In types.ts: content: string | object.
            // In DB: content is TEXT.
            // If it mimics JSON, we might want to check if it parses? 
            // For now assume string unless it was saved as JSON string.
            createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
            metadata: row.configuration
        };
    }

    private mapRowToKnowledgeItem(row: any): KnowledgeItem {
        return {
            id: row.id,
            projectId: row.project_id,
            sourceInputId: row.source_input_id,
            type: row.type,
            content: row.content,
            tags: row.tags || [],
            importance: row.importance,
            createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at
        };
    }
}
