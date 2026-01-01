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

  // Force JSON mode for reliability
  const rawResponse = await runLLM(systemPrompt + "\nRETURN ONLY JSON.", userContent, true);

  // Robust JSON extraction (find outer braces)
  const firstBrace = rawResponse.indexOf('{');
  const lastBrace = rawResponse.lastIndexOf('}');

  let jsonStr = rawResponse;
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = rawResponse.substring(firstBrace, lastBrace + 1);
  } else {
    // Fallback cleanup
    jsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  let contentObj: any;
  try {
    contentObj = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse analysis JSON", e);
    // Fallback to string if parsing fails, but we strive for object
    contentObj = jsonStr;
  }

  return {
    title: 'Analyze: Structural & Reflective',
    content: contentObj,
    type: 'analysis' as any
  };
}
