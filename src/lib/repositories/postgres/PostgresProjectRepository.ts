import { sql } from '@vercel/postgres';
import { IProjectRepository } from '../interfaces';
import { Project, Session, KnowledgeInput, SkillOutput } from '../../types';

export class PostgresProjectRepository implements IProjectRepository {

    async getAll(): Promise<Project[]> {
        const { rows } = await sql`
            SELECT * FROM projects 
            WHERE status != 'deleted'
            ORDER BY updated_at DESC
        `;

        // Return projects with empty sessions for list view performance
        return rows.map(row => this.mapRowToProject(row));
    }

    async getById(id: string): Promise<Project | undefined> {
        // 1. Fetch Project
        const { rows: projectRows } = await sql`
            SELECT * FROM projects WHERE id = ${id} AND status != 'deleted'
        `;

        if (projectRows.length === 0) return undefined;

        const project = this.mapRowToProject(projectRows[0]);

        // 2. Fetch Sessions
        const { rows: sessionRows } = await sql`
            SELECT * FROM sessions 
            WHERE project_id = ${id}
            ORDER BY session_number ASC
        `;

        // 3. Fetch Inputs for these sessions
        const { rows: inputRows } = await sql`
            SELECT * FROM inputs 
            WHERE session_id IN (SELECT id FROM sessions WHERE project_id = ${id})
        `;

        // 4. Fetch Outputs (Project level AND Session level)
        // We fetch project outputs here. Session outputs could be fetched too.
        // Let's fetch ALL outputs related to this project context
        const { rows: outputRows } = await sql`
            SELECT * FROM outputs 
            WHERE (scope_type = 'PROJECT' AND scope_id = ${id})
               OR (scope_type = 'SESSION' AND scope_id IN (SELECT id FROM sessions WHERE project_id = ${id}))
        `;

        // Reassemble Graph
        project.sessions = sessionRows.map(sRow => {
            const session = this.mapRowToSession(sRow);
            session.inputs = inputRows
                .filter(i => i.session_id === sRow.id)
                .map(this.mapRowToInput);

            session.outputs = outputRows
                .filter(o => o.scope_type === 'SESSION' && o.scope_id === sRow.id)
                .map(this.mapRowToOutput);

            return session;
        });

        project.outputs = outputRows
            .filter(o => o.scope_type === 'PROJECT' && o.scope_id === id)
            .map(this.mapRowToOutput);

        return project;
    }

    async create(project: Project): Promise<Project> {
        const { rows } = await sql`
            INSERT INTO projects (id, title, description, type, variant, created_at, updated_at)
            VALUES (${project.id}, ${project.title}, ${project.description || ''}, ${project.type}, 'default', ${project.createdAt}, ${project.createdAt})
            RETURNING *
        `;
        return this.mapRowToProject(rows[0]);
    }

    async update(id: string, updates: Partial<Project>): Promise<Project | undefined> {
        // Build dynamic query
        // This is a bit manual without an ORM, but we can handle specific cases or use a helper.
        // For now, let's handle title and updated_at which are most common

        if (updates.title) {
            await sql`
                UPDATE projects SET title = ${updates.title}, updated_at = NOW() WHERE id = ${id}
            `;
        }

        // Add more fields as needed or genericise later

        return this.getById(id);
    }

    async delete(id: string): Promise<boolean> {
        // Soft delete
        await sql`
            UPDATE projects SET status = 'deleted', updated_at = NOW() WHERE id = ${id}
        `;
        return true;
    }

    // --- Mappers ---

    private mapRowToProject(row: any): Project {
        return {
            id: row.id,
            title: row.title,
            type: row.type as any,
            description: row.description,
            createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
            sessions: [], // Populated later
            outputs: [],
            totalSessions: row.total_sessions_planned
        };
    }

    private mapRowToSession(row: any): Session {
        return {
            id: row.id,
            projectId: row.project_id,
            sessionNumber: row.session_number,
            title: row.title,
            date: row.date ? (row.date.toISOString ? row.date.toISOString().split('T')[0] : row.date) : undefined,
            inputs: [],
            outputs: [],
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
            createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at
        };
    }

    private mapRowToOutput(row: any): SkillOutput {
        return {
            id: row.id,
            skillId: row.skill_id,
            sessionId: row.scope_id, // Note: This might be projectId if scope_type is PROJECT. Context aware mapping needed.
            type: row.type,
            title: row.title,
            content: row.content,
            createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at,
            metadata: row.configuration
        };
    }
}
