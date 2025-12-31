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
        } catch (e: any) {
            // Check if we can write
            try {
                await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
                const initialStore: KnowledgeStore = { projects: [], templates: [] };
                await fs.writeFile(DATA_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
            } catch (writeError) {
                console.warn('JsonAdapter: Could not write to data file (likely readonly env). Skipping init.', writeError);
            }
        }
    }

    public async readStore(): Promise<KnowledgeStore> {
        try {
            await this.ensureDataFile();
            const data = await fs.readFile(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.warn('JsonAdapter: Read failed, returning empty store.', error);
            return { projects: [], templates: [] };
        }
    }

    public async writeStore(store: KnowledgeStore) {
        try {
            await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
        } catch (error) {
            console.error('JsonAdapter: Write failed.', error);
            // In Vercel, this is expected if using fs. 
            // We allow it to fail silently or log, so build doesn't crash.
        }
    }
}
