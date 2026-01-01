
import { SkillInput, SkillOutput } from '../types';
import { runLLM } from './base';

export async function generateNotebookLMPackSkill({ session, inputs, options }: SkillInput): Promise<Partial<SkillOutput>> {
    const inputContent = inputs.map(i => `[${i.type.toUpperCase()}] ${i.title}:\n${i.content}`).join('\n\n---\n\n');

    // Check if there is existing analysis to include
    const existingAnalysis = session.outputs?.find((o: any) => o.skillId === 'analyze');
    let analysisContext = "";
    if (existingAnalysis) {
        const content = typeof existingAnalysis.content === 'string' ? existingAnalysis.content : JSON.stringify(existingAnalysis.content, null, 2);
        analysisContext = `\n\n[EXISTING STRUCTURAL ANALYSIS]\n${content}\n\n`;
    }

    // --- CONTEXT PROMPT GENERATION ---
    const audience = options?.audience || 'Public';
    const structure = options?.structure || 'Strategic';

    let audienceInstruction = "";
    switch (audience) {
        case 'Executive':
            audienceInstruction = `TARGET AUDIENCE: Management Executives.
            TONE: Concise, high-level, business-impact focused.
            GOAL: Create a targeted report for decision makers. Prioritize "So What?" and Roi/Startategic implications.`;
            break;
        case 'Self':
            audienceInstruction = `TARGET AUDIENCE: Self/Personal (For the author).
            TONE: Simple, raw, unadorned Markdown.
            GOAL: Create a clean memory aid. Focus on factual recording and personal reference notes. No fluff.`;
            break;
        case 'Public':
        default:
            audienceInstruction = `TARGET AUDIENCE: General Public / SNS / Blog Readers.
            TONE: Engaging, accessible, shareable, "Thought Leader" style.
            GOAL: Create a knowledge asset that is valuable to share. Use engaging headers and clear storytelling.`;
            break;
    }

    let structureInstruction = "";
    switch (structure) {
        case 'Technical':
            structureInstruction = `FOCUS: Technical details & Implementation.
            PRIORITY: Architecture, specific tools, code patterns, "How-to", and engineering constraints.`;
            break;
        case 'Educational':
            structureInstruction = `FOCUS: Educational & Learning.
            PRIORITY: Key takeaways, concept explanations, study notes, "What is X?", and foundational knowledge.`;
            break;
        case 'Strategic':
        default:
            structureInstruction = `FOCUS: Strategic perspective.
            PRIORITY: High-level vision, long-term goals, "Why", and ecosystem impact.`;
            break;
    }

    const systemPrompt = `You are a Knowledge Crystallization Engine. Your specific task is to generate a comprehensive "Knowledge Pack" for a given session.
    
    A "Knowledge Pack" is a rich, structured Markdown document designed to be a high-quality data source or a standalone report.
    It should be approximately 3000 characters in length (in Japanese).

    ${audienceInstruction}
    ${structureInstruction}

    OBJECTIVE:
    Integrate all raw inputs and any pre-existing analysis into a single, cohesive, readable Markdown document following the tone and focus above.

    STRUCTURE:
    1. **Title & Context**: Session title, date, and purpose.
    2. **Executive Summary**: A high-level synthesis of what happened and what was discussed.
    3. **Key Themes & Concepts**: The core ideas extracted from the inputs (Aligned with the Strategy Focus).
    4. **Detailed Content Breakdown**: Iterate through the discussions/inputs and provide detailed summaries.
    5. **Synthesis & Insights**: Connect the dots between different inputs (Aligned with the Audience Goal).
    6. **Raw Data Appendices**: (Optional) Brief excerpts of critical quotes or data points.

    CONSTRAINTS:
    - OUTPUT LANGUAGE: JAPANESE (日本語) ONLY.
    - Format: Clean Markdown (headers, bullet points, bold text).
    - Length: ~3000 characters. Detailed and comprehensive.
    `;

    const userContent = `Session Title: ${session.title}\nSession Date: ${session.date || 'N/A'}\n\nINPUT DATA:\n${inputContent}${analysisContext}`;

    const generatedMarkdown = await runLLM(systemPrompt, userContent);

    return {
        type: 'pack', // Custom type for this artifact
        title: `即時統合パック: ${session.title}`,
        content: generatedMarkdown
    };
}

export async function generateProjectNotebookLMPackSkill({ project, inputs, options }: { project: any, inputs: any[], options?: any }): Promise<Partial<SkillOutput>> {
    const inputContent = inputs.map(i => `[${i.type.toUpperCase()}] ${i.title} (Session: ${i.sessionTitle || 'N/A'}):\n${i.content}`).join('\n\n---\n\n');

    // Check if there is existing project analysis
    const existingAnalysis = project.outputs?.find((o: any) => o.skillId === 'analyze');
    let analysisContext = "";
    if (existingAnalysis) {
        const content = typeof existingAnalysis.content === 'string' ? existingAnalysis.content : JSON.stringify(existingAnalysis.content, null, 2);
        analysisContext = `\n\n[EXISTING SCORED ANALYSIS]\n${content}\n\n`;
    }

    // --- CONTEXT PROMPT GENERATION ---
    const audience = options?.audience || 'Public';
    const structure = options?.structure || 'Strategic';

    let audienceInstruction = "";
    switch (audience) {
        case 'Executive':
            audienceInstruction = `TARGET AUDIENCE: Management Executives.
            TONE: Concise, high-level, business-impact focused.
            GOAL: Create a targeted report for decision makers. Prioritize "So What?" and Roi/Startategic implications.`;
            break;
        case 'Self':
            audienceInstruction = `TARGET AUDIENCE: Self/Personal (For the author).
            TONE: Simple, raw, unadorned Markdown.
            GOAL: Create a clean memory aid. Focus on factual recording and personal reference notes. No fluff.`;
            break;
        case 'Public':
        default:
            audienceInstruction = `TARGET AUDIENCE: General Public / SNS / Blog Readers.
            TONE: Engaging, accessible, shareable, "Thought Leader" style.
            GOAL: Create a knowledge asset that is valuable to share. Use engaging headers and clear storytelling.`;
            break;
    }

    let structureInstruction = "";
    switch (structure) {
        case 'Technical':
            structureInstruction = `FOCUS: Technical details & Implementation.
            PRIORITY: Architecture, specific tools, code patterns, "How-to", and engineering constraints.`;
            break;
        case 'Educational':
            structureInstruction = `FOCUS: Educational & Learning.
            PRIORITY: Key takeaways, concept explanations, study notes, "What is X?", and foundational knowledge.`;
            break;
        case 'Strategic':
        default:
            structureInstruction = `FOCUS: Strategic perspective.
            PRIORITY: High-level vision, long-term goals, "Why", and ecosystem impact.`;
            break;
    }

    const systemPrompt = `You are a Knowledge Crystallization Engine. Your specific task is to generate a comprehensive "Knowledge Pack" for an entire PROJECT.
    
    A "Knowledge Pack" is a rich, structured Markdown document designed to be a high-quality data source or a standalone report.
    It should be approximately 3000 characters in length (in Japanese).

    ${audienceInstruction}
    ${structureInstruction}

    OBJECTIVE:
    Integrate all raw inputs from ALL SESSIONS and any pre-existing project analysis into a single, cohesive, readable Markdown document following the tone and focus above.

    STRUCTURE:
    1. **Project Title & Context**: Project overview, total sessions, and purpose.
    2. **Executive Summary**: A high-level synthesis of the entire project curriculum.
    3. **Key Themes & Longitudinal Concepts**: The core ideas that spanned across multiple sessions (Aligned with the Strategy Focus).
    4. **Session-by-Session Breakdown**: A structured walkthrough of the project's journey.
    5. **Synthesis & Insights**: Deep connections and "Aha!" moments from the collective data (Aligned with the Audience Goal).
    6. **Raw Data Appendices**: (Optional) Brief excerpts of critical quotes or data points.

    CONSTRAINTS:
    - OUTPUT LANGUAGE: JAPANESE (日本語) ONLY.
    - Format: Clean Markdown (headers, bullet points, bold text).
    - Length: ~3000 characters. Detailed and comprehensive.
    `;

    const userContent = `Project Title: ${project.title}\n\nINPUT DATA (All Sessions):\n${inputContent}${analysisContext}`;

    const generatedMarkdown = await runLLM(systemPrompt, userContent);

    return {
        type: 'pack',
        title: `プロジェクト統合パック: ${project.title}`,
        content: generatedMarkdown
    };
}
