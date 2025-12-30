import { KnowledgeInput, Session } from '../types';
import { openai } from '../ai';

export interface SkillContext {
    session: Session;
    inputs: KnowledgeInput[];
}

export interface SkillResult {
    title: string;
    content: string; // Markdown
    type: 'summary' | 'report' | 'homework' | 'ppt' | 'sns';
}

export async function runLLM(systemPrompt: string, userContent: string): Promise<string> {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ],
            temperature: 0.7,
        });
        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('AI Error:', error);
        throw new Error('Failed to generate AI response');
    }
}
