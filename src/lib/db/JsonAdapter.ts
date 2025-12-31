import fs from 'fs/promises';
import path from 'path';
import { KnowledgeStore } from '../types';

const DATA_FILE = path.join(process.cwd(), 'data', 'knowledge-v1.json');

export class JsonAdapter {
    private static instance: JsonAdapter;

    private constructor() { }

    public static getInstance(): JsonAdapter {
        if (!JsonAdapter.instance) {
            JsonAdapter.instance = new JsonAdapter();
        }
        return JsonAdapter.instance;
    }

    private async ensureDataFile() {
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
            const initialStore: KnowledgeStore = { projects: [] };
            await fs.writeFile(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
        }
    }

    public async readStore(): Promise<KnowledgeStore> {
        await this.ensureDataFile();
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    }

    public async writeStore(store: KnowledgeStore) {
        await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
    }
}
