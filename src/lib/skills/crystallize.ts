
import { SkillInput, SkillOutput } from '../types';
import { runLLM } from './base';

export async function generateNotebookLMPackSkill({ session, inputs }: SkillInput): Promise<Partial<SkillOutput>> {
    const inputContent = inputs.map(i => `[${i.type.toUpperCase()}] ${i.title}:\n${i.content}`).join('\n\n---\n\n');

    // Check if there is existing analysis to include
    const existingAnalysis = session.outputs?.find(o => o.skillId === 'analyze');
    let analysisContext = "";
    if (existingAnalysis) {
        const content = typeof existingAnalysis.content === 'string' ? existingAnalysis.content : JSON.stringify(existingAnalysis.content, null, 2);
        analysisContext = `\n\n[EXISTING STRUCTURAL ANALYSIS]\n${content}\n\n`;
    }

    const systemPrompt = `You are a Knowledge Crystallization Engine. Your specific task is to generate a comprehensive "NotebookLM Pack" for a given session.
    
    A "NotebookLM Pack" is a rich, structured Markdown document designed to be a high-quality data source for Google's NotebookLM. It should be approximately 3000 characters in length (in Japanese).

    OBJECTIVE:
    Integrate all raw inputs and any pre-existing analysis into a single, cohesive, readable Markdown document.

    STRUCTURE:
    1. **Title & Context**: Session title, date, and purpose.
    2. **Executive Summary**: A high-level synthesis of what happened and what was discussed.
    3. **Key Themes & Concepts**: The core ideas extracted from the inputs.
    4. **Detailed Content Breakdown**: Iterate through the discussions/inputs and provide detailed summaries, preserving important nuances.
    5. **Synthesis & Insights**: Connect the dots between different inputs.
    6. **Raw Data Appendices**: (Optional) Brief excerpts of critical quotes or data points.

    CONSTRAINTS:
    - OUTPUT LANGUAGE: JAPANESE (日本語) ONLY.
    - Format: Clean Markdown (headers, bullet points, bold text).
    - Length: ~3000 characters. Detailed and comprehensive.
    - Tone: Professional, academic, and analytical.
    `;

    const userContent = `Session Title: ${session.title}\nSession Date: ${session.date || 'N/A'}\n\nINPUT DATA:\n${inputContent}${analysisContext}`;

    const generatedMarkdown = await runLLM(systemPrompt, userContent);

    return {
        type: 'pack', // Custom type for this artifact
        title: `即時統合パック: ${session.title}`,
        content: generatedMarkdown
    };
}
