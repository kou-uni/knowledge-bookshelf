import { SkillContext, SkillResult, runLLM } from './base';

export async function summarizeSessionSkill(context: SkillContext): Promise<SkillResult> {
  const { session, inputs } = context;

  if (inputs.length === 0) {
    return {
      title: 'Session Summary',
      content: 'No inputs found to summarize. Please add notes or files first.',
      type: 'summary'
    };
  }

  const inputsText = inputs.map((input, i) => `
    --- Input ${i + 1} (${input.type}) ---
    Title: ${input.title}
    Content: ${input.content}
  `).join('\n');

  const systemPrompt = `
    You are an expert Knowledge Manager analyzing a corporate training session.
    Your goal is to synthesize multiple inputs into a structured "Session Summary".
    
    Structure your response in Markdown:
    ## 1. Objective Key Points (Fact-based)
    - List the core concepts, theories, or frameworks discussed.
    - Be concise and precise.

    ## 2. Subjective Insights (Reflections)
    - Synthesize the key takeaways, realizations, or "Aha!" moments found in the notes.
    - Relate them to practical business applications if possible.

    ## 3. Next Actions
    - Identify any specific action items or homework mentioned.
  `;

  const userContent = `
    Session Title: ${session.title}
    Inputs:
    ${inputsText}
  `;

  const generatedText = await runLLM(systemPrompt, userContent);

  return {
    title: 'Session Summary (AI)',
    content: generatedText,
    type: 'summary'
  };
}
