import { ITemplateRepository } from '../interfaces';
import { InstructionTemplate } from '../../types';
import { JsonAdapter } from '../../db/JsonAdapter';

export class JsonTemplateRepository implements ITemplateRepository {
    private adapter: JsonAdapter;

    constructor() {
        this.adapter = JsonAdapter.getInstance();
    }

    async getAll(): Promise<InstructionTemplate[]> {
        const store = await this.adapter.readStore();
        return store.templates || [];
    }

    async create(template: InstructionTemplate): Promise<InstructionTemplate> {
        const store = await this.adapter.readStore();
        if (!store.templates) store.templates = [];

        store.templates.push(template);
        await this.adapter.writeStore(store);
        return template;
    }

    async delete(id: string): Promise<boolean> {
        const store = await this.adapter.readStore();
        if (!store.templates) return false;

        const initialLen = store.templates.length;
        store.templates = store.templates.filter(t => t.id !== id);

        if (store.templates.length !== initialLen) {
            await this.adapter.writeStore(store);
            return true;
        }
        return false;
    }
}
