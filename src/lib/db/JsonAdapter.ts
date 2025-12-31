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
        // Disabled for Vercel Build
    }

    public async readStore(): Promise<KnowledgeStore> {
        // Return empty store to pass build
        return { projects: [], templates: [] };
    }

    public async writeStore(store: KnowledgeStore) {
        // No-op for Vercel Build
        return;
    }
}
