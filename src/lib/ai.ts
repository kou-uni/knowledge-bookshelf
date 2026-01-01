import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export const getOpenAIClient = () => {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
        });
    }
    return openaiClient;
};

