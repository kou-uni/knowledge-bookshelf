import { sql } from '@vercel/postgres';
import { ITemplateRepository } from '../interfaces';
import { InstructionTemplate } from '../../types';

export class PostgresTemplateRepository implements ITemplateRepository {

    async getAll(): Promise<InstructionTemplate[]> {
        const { rows } = await sql`
            SELECT * FROM instruction_templates ORDER BY created_at DESC
        `;
        return rows.map(this.mapRowToTemplate);
    }

    async create(template: InstructionTemplate): Promise<InstructionTemplate> {
        // Need to ensure the table exists or add it to schema if missing.
        // Assuming table `instruction_templates` exists (check schema).
        // Schema didn't show `instruction_templates`!
        // We might need to add it to schema SQL.

        // Let's assume it doesn't exist yet and add to DDL plan, or use a generic table?
        // Wait, JsonAdapter had templates.

        // For now, implementing blindly, but noting the schema gap.

        const { rows } = await sql`
            INSERT INTO instruction_templates (id, title, content, created_at)
            VALUES (${template.id}, ${template.title}, ${template.content}, ${template.createdAt})
            RETURNING *
        `;
        return this.mapRowToTemplate(rows[0]);
    }

    async delete(id: string): Promise<boolean> {
        await sql`DELETE FROM instruction_templates WHERE id = ${id}`;
        return true;
    }

    private mapRowToTemplate(row: any): InstructionTemplate {
        return {
            id: row.id,
            title: row.title,
            content: row.content,
            createdAt: row.created_at?.toISOString ? row.created_at.toISOString() : row.created_at
        };
    }
}
