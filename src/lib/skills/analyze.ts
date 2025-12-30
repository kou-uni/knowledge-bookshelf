import { SkillContext, SkillResult, runLLM } from './base';

export interface AnalysisResult {
    objective: {
        concepts: string[];
        frameworks: string[];
        evidence: string[];
    };
    subjective: {
        observation: string;
        interpretation: string;
        application: string;
    };
}

export async function analyzeSessionSkill(context: SkillContext): Promise<SkillResult> {
    const { session, inputs } = context;

    if (inputs.length === 0) {
        return {
            title: 'Analysis (Empty)',
            content: 'No inputs to analyze.',
            type: 'analysis' as any // Temporary type cast until updated
        };
    }

    const inputsText = inputs.map((input, i) => `
    [Input ${i + 1}]: ${input.content}
  `).join('\n');

    const systemPrompt = `
    You are an expert Analytic Engine for corporate training.
    Your goal is to normalize and structure raw inputs into two distinct categories:
    1. Structural Analysis (Objective)
    2. Reflective Application (Subjective)

    Output must be valid JSON with this schema:
    {
      "objective": {
        "concepts": ["List of core definitions"],
        "frameworks": ["List of models/theories used"],
        "evidence": ["List of facts/data cited"]
      },
      "subjective": {
        "observation": "What happened? (Fact-based summary of experience)",
        "interpretation": "So What? (Meaning and insight derived)",
        "application": "Now What? (Actionable next steps)"
      }
    }
  `;

    const userContent = `
    Session: ${session.title}
    Inputs:
    ${inputsText}
  `;

    // Force JSON mode in prompt or post-process? 
    // For MVP, we'll ask for JSON and try to parse it, or fallback to text.
    const rawResponse = await runLLM(systemPrompt + "\nRETURN ONLY JSON.", userContent);

    // Clean up code blocks if present
    const jsonContent = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return {
        title: 'Analyze: Structural & Reflective',
        content: jsonContent,
        type: 'analysis' as any
    };
}
