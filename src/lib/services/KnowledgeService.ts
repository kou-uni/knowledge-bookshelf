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

        // 2. Real AI Analysis
        console.log(`[KnowledgeService] Starting AI analysis for input: ${input.id}`);
        const newItems = await this.performAIAnalysis(projectId, input);
        console.log(`[KnowledgeService] AI returned ${newItems.length} items`);

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

    /**
     * Replaces mock logic with real OpenAI analysis.
     */
    private async performAIAnalysis(projectId: string, input: KnowledgeInput): Promise<KnowledgeItem[]> {
        const now = new Date().toISOString();
        let systemPrompt = `
You are an expert Knowledge Analyst. You analyze inputs (text, voice transcripts, or images) to extract "Knowledge Atoms".
A Knowledge Atom corresponds to one of 4 types:
1. Fact (Observation of reality, data)
2. Insight (Interpretation, connection, pattern)
3. Decision (Actionable conclusion, assignment)
4. Projection (Future prediction, risk)

You MUST output a JSON object with a key "items" which is an array of objects.
Each object must have:
- type: "fact" | "insight" | "quote" | "image_analysis"
- content: string (Concise, clear)
- tags: string[] (1-3 keywords)
- importance: number (1-5)

For images, use type "image_analysis" or "fact" depending on certainty.
For text/voice, use "quote" if it's a direct important statement.

IMPORTANT: The 'content' and 'tags' fields MUST be written in Japanese (日本語).
`;

        let userContent = `Analyze this input:\nTitle: ${input.title}\nContent: ${input.content}`;
        let imageUrl: string | undefined = undefined;

        if (input.type === 'image' && input.rawUrl) {
            userContent = `Analyze this image input. Title: ${input.title}. The textual content provided is minimal, so rely on the visual information.`;
            imageUrl = input.rawUrl;
        }

        try {
            // Import dynamically to avoid circular dependencies if any, or just strictly use base
            const { runLLM, runLLMWithVision } = await import('../skills/base');

            const jsonStr = await runLLMWithVision(systemPrompt + "\nOutput JSON only.", userContent, imageUrl);

            // Cleanup JSON block formatting if present
            const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            if (!parsed.items || !Array.isArray(parsed.items)) {
                console.warn('AI returned invalid structure:', cleanJson);
                return [];
            }

            return parsed.items.map((item: any) => ({
                id: crypto.randomUUID(),
                projectId,
                sourceInputId: input.id,
                type: item.type || 'fact', // Fallback
                content: item.content || '',
                tags: item.tags || [],
                importance: item.importance || 3,
                createdAt: now
            }));

        } catch (e) {
            console.error('Real AI Analysis Failed:', e);
            // Fallback to a simple error item so UI shows something
            return [{
                id: crypto.randomUUID(),
                projectId,
                sourceInputId: input.id,
                type: 'fact',
                content: 'AI Analysis failed to parse the input. Please try again.',
                tags: ['Error'],
                importance: 5,
                createdAt: now
            }];
        }
    }

    private mockAnalysisLogic(projectId: string, input: KnowledgeInput): KnowledgeItem[] {
        // ... kept for reference if needed, but unused.
        return [];
    }
}
