import { SessionService } from './SessionService';
import { KnowledgeItem, KnowledgeInput } from '../types';

export class KnowledgeService {
    private sessionService: SessionService;

    constructor() {
        this.sessionService = new SessionService();
    }

    /**
     * Analyzes an input and extracts "Knowledge Items" (Wisdom Atoms).
     * Currently mocks the AI process.
     */
    async analyzeInput(projectId: string, sessionId: string, inputId: string): Promise<KnowledgeItem[]> {
        // 1. Get Session & Input validation
        const session = await this.sessionService.getSession(projectId, sessionId);
        if (!session) throw new Error('Session not found');

        const input = session.inputs.find(i => i.id === inputId);
        if (!input) throw new Error('Input not found');

        // 2. Mock Analysis (Simulate AI Latency)
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay

        const newItems = this.mockAnalysisLogic(projectId, input);

        // 3. Persist
        // Replace previous analysis for this specific input
        const currentItems = session.knowledgeItems || [];
        const otherItems = currentItems.filter(item => item.sourceInputId !== input.id);
        const updatedItems = [...otherItems, ...newItems];

        await this.sessionService.updateSession(projectId, sessionId, {
            knowledgeItems: updatedItems
        });

        return newItems;
    }

    async getKnowledgeItems(projectId: string, sessionId: string): Promise<KnowledgeItem[]> {
        const session = await this.sessionService.getSession(projectId, sessionId);
        return session?.knowledgeItems || [];
    }

    private mockAnalysisLogic(projectId: string, input: KnowledgeInput): KnowledgeItem[] {
        const items: KnowledgeItem[] = [];
        const now = new Date().toISOString();

        if (input.type === 'image') {
            // Scene: Whiteboard Strategy Meeting

            // 1. Observation (Fact / Past)
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'fact',
                content: '[Observation] Q3 Sales target is set to $1.2M (+20% YoY). Confirmed by Fin Dept.',
                tags: ['Finance', 'Result', 'Target'],
                importance: 5,
                createdAt: now
            });

            // 2. Analysis (Insight / Past)
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'insight',
                content: '[Analysis] Customer Onboarding is identified as the primary bottleneck due to manual data entry.',
                tags: ['Operations', 'Bottleneck', 'Analysis'],
                importance: 4,
                createdAt: now
            });

            // 3. Decision (Fact / Future)
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'fact',
                content: '[Decision] Action: Automate the entry process by End of Month. Assigned to Tech Team.',
                tags: ['Decision', 'Tech', 'Time'], // Decision = Future Fact
                importance: 5,
                createdAt: now
            });

            // 4. Projection (Insight / Future)
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'image_analysis',
                content: '[Projection] Diagram A suggests a circular dependency risk if Marketing API isn\'t ready.',
                tags: ['Risk', 'Product', 'Diagram'],
                importance: 3,
                createdAt: now
            });

        } else if (input.type === 'voice') {
            // Voice Logic: 4 Quadrants
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'quote',
                content: '"We need to ship this before the competitor event in March." (Manager)',
                tags: ['Deadline', 'Competitor', 'Urgent'],
                importance: 5,
                createdAt: now
            });
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'insight',
                content: '[Analysis] The team seems anxious about the tight deadline. Burnout risk detected.',
                tags: ['InternalTeam', 'Sentiment', 'Risk'],
                importance: 4,
                createdAt: now
            });
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'fact',
                content: '[Decision] Action: Hire 2 contractors for QA tasks immediately.',
                tags: ['Decision', 'HR', 'Budget'],
                importance: 5,
                createdAt: now
            });
        } else {
            // Text / File Logic
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'fact',
                content: `[Observation] Key metric found in document: Client Retention Rate = 85%.`,
                tags: ['Client', 'Metric', 'Status'],
                importance: 3,
                createdAt: now
            });
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'insight',
                content: `[Analysis] The tone of the document suggests a strategic pivot towards Enterprise sales.`,
                tags: ['Strategy', 'Analysis', 'Market'],
                importance: 4,
                createdAt: now
            });
            items.push({
                id: Math.random().toString(36).substring(7),
                projectId,
                sourceInputId: input.id,
                type: 'insight',
                content: `[Projection] If trends continue, Q4 revenue might miss targets by 10%.`,
                tags: ['Finance', 'Risk', 'Projection'],
                importance: 5,
                createdAt: now
            });
        }

        return items;
    }
}
