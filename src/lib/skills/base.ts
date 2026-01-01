import { KnowledgeInput, Session } from '../types';
import { getOpenAIClient } from '../ai';

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
        const openai = getOpenAIClient();
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

export async function runLLMWithVision(systemPrompt: string, userContent: string, imageUrl?: string): Promise<string> {
    try {
        const openai = getOpenAIClient();

        const messages: any[] = [
            { role: 'system', content: systemPrompt },
        ];

        if (imageUrl) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: userContent },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageUrl, // Expecting base64 data url
                        },
                    },
                ],
            });
        } else {
            messages.push({ role: 'user', content: userContent });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
        });

        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('AI Vision Error:', error);
        throw new Error('Failed to generate AI Vision response');
    }
}
