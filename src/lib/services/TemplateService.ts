import { ITemplateRepository } from '../repositories/interfaces';
import { JsonTemplateRepository } from '../repositories/json/JsonTemplateRepository';
import { InstructionTemplate } from '../types';

export class TemplateService {
    private templateRepo: ITemplateRepository;

    constructor() {
        this.templateRepo = new JsonTemplateRepository();
    }

    async getTemplates(): Promise<InstructionTemplate[]> {
        return this.templateRepo.getAll();
    }

    async createTemplate(title: string, content: string): Promise<InstructionTemplate> {
        const newTemplate: InstructionTemplate = {
            id: Math.random().toString(36).substring(7),
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
