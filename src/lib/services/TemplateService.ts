import { ITemplateRepository } from '../repositories/interfaces';
import { PostgresTemplateRepository } from '../repositories/postgres/PostgresTemplateRepository';
import { InstructionTemplate } from '../types';

export class TemplateService {
    private templateRepo: ITemplateRepository;

    constructor() {
        this.templateRepo = new PostgresTemplateRepository();
    }

    async getTemplates(): Promise<InstructionTemplate[]> {
        return this.templateRepo.getAll();
    }

    async createTemplate(title: string, content: string): Promise<InstructionTemplate> {
        const newTemplate: InstructionTemplate = {
            id: crypto.randomUUID(),
            title,
            content,
            createdAt: new Date().toISOString()
        };
        return this.templateRepo.create(newTemplate);
    }

    async deleteTemplate(id: string): Promise<boolean> {
        return this.templateRepo.delete(id);
    }
}
