import { IProjectRepository } from '../interfaces';
import { Project } from '../../../types';
import { JsonAdapter } from '../../db/JsonAdapter';

export class JsonProjectRepository implements IProjectRepository {
    private adapter: JsonAdapter;

    constructor() {
        this.adapter = JsonAdapter.getInstance();
    }

    async getAll(): Promise<Project[]> {
        const store = await this.adapter.readStore();
        return store.projects;
    }

    async getById(id: string): Promise<Project | undefined> {
        const store = await this.adapter.readStore();
        return store.projects.find(p => p.id === id);
    }

    async create(project: Project): Promise<Project> {
        const store = await this.adapter.readStore();
        store.projects.unshift(project);
        await this.adapter.writeStore(store);
        return project;
    }

    async update(id: string, updates: Partial<Project>): Promise<Project | undefined> {
        const store = await this.adapter.readStore();
        const index = store.projects.findIndex(p => p.id === id);
        if (index === -1) return undefined;

        store.projects[index] = { ...store.projects[index], ...updates };
        await this.adapter.writeStore(store);
        return store.projects[index];
    }

    async delete(id: string): Promise<boolean> {
        const store = await this.adapter.readStore();
        const initialLength = store.projects.length;
        store.projects = store.projects.filter(p => p.id !== id);

        if (store.projects.length !== initialLength) {
            await this.adapter.writeStore(store);
            return true;
        }
        return false;
    }
}
