
import { SkillInput, SkillOutput } from '../types';
import { runLLM } from './base';

export async function generateNotebookLMPackSkill({ session, inputs }: SkillInput): Promise<Partial<SkillOutput>> {
    const inputContent = inputs.map(i => `[${i.type.toUpperCase()}] ${i.title}:\n${i.content}`).join('\n\n---\n\n');

    // Check if there is existing analysis to include
    const existingAnalysis = session.outputs?.find((o: any) => o.skillId === 'analyze');
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

export async function generateProjectNotebookLMPackSkill({ project, inputs }: { project: any, inputs: any[] }): Promise<Partial<SkillOutput>> {
    const inputContent = inputs.map(i => `[${i.type.toUpperCase()}] ${i.title} (Session: ${i.sessionTitle || 'N/A'}):\n${i.content}`).join('\n\n---\n\n');

    // Check if there is existing project analysis
    const existingAnalysis = project.outputs?.find((o: any) => o.skillId === 'analyze');
    let analysisContext = "";
    if (existingAnalysis) {
        const content = typeof existingAnalysis.content === 'string' ? existingAnalysis.content : JSON.stringify(existingAnalysis.content, null, 2);
        analysisContext = `\n\n[EXISTING SCORED ANALYSIS]\n${content}\n\n`;
    }

    const systemPrompt = `You are a Knowledge Crystallization Engine. Your specific task is to generate a comprehensive "NotebookLM Pack" for an entire PROJECT.
    
    A "NotebookLM Pack" is a rich, structured Markdown document designed to be a high-quality data source for Google's NotebookLM. It should be approximately 3000 characters in length (in Japanese).

    OBJECTIVE:
    Integrate all raw inputs from ALL SESSIONS and any pre-existing project analysis into a single, cohesive, readable Markdown document.

    STRUCTURE:
    1. **Project Title & Context**: Project overview, total sessions, and purpose.
    2. **Executive Summary**: A high-level synthesis of the entire project curriculum.
    3. **Key Themes & Longitudinal Concepts**: The core ideas that spanned across multiple sessions.
    4. **Session-by-Session Breakdown**: A structured walkthrough of the project's journey.
    5. **Synthesis & Insights**: Deep connections and "Aha!" moments from the collective data.
    6. **Raw Data Appendices**: (Optional) Brief excerpts of critical quotes or data points.

    CONSTRAINTS:
    - OUTPUT LANGUAGE: JAPANESE (日本語) ONLY.
    - Format: Clean Markdown (headers, bullet points, bold text).
    - Length: ~3000 characters. Detailed and comprehensive.
    - Tone: Professional, academic, and analytical.
    `;

    const userContent = `Project Title: ${project.title}\n\nINPUT DATA (All Sessions):\n${inputContent}${analysisContext}`;

    const generatedMarkdown = await runLLM(systemPrompt, userContent);

    return {
        type: 'pack',
        title: `プロジェクト統合パック: ${project.title}`,
        content: generatedMarkdown
    };
}
