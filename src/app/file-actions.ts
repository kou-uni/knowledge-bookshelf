'use server';

export async function extractFileText(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        if (file.type === 'application/pdf') {
            try {
                // Dynamic import to isolate potential loading issues
                // Using pdf-parse which is simpler for text extraction
                const pdf = await import('pdf-parse/lib/pdf-parse.js');
                const data = await pdf.default(buffer);
                text = data.text;
            } catch (pdfError: any) {
                console.error('PDF Parse Error:', pdfError);
                return { error: 'PDF parsing failed. The server environment may not support this PDF version.' };
            }
        }

        // Basic text fallback for other allowed types
        else if (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/markdown') {
            text = buffer.toString('utf-8');
        } else {
            return { error: 'Unsupported file type for extraction. Please copy text manually.' };
        }

        // [NEW] Auto-summarize if too long (> 1000 chars)
        if (text && text.length > 1000) {
            try {
                // Import locally to avoid build-time issues if not used
                const { runLLM } = await import('@/lib/skills/base');
                const systemPrompt = `You are a professional editor. The user wants to register this document but it is too long.
                Summarize the following text into a condensed version (maximum 1000 characters) in Japanese.
                Capture the core essence and key points. Do not lose important meaning.`;

                const summary = await runLLM(systemPrompt, text);
                text = "**[Auto-Summarized by AI]**\n" + summary;
            } catch (llmError) {
                console.error('Summarization failed:', llmError);
                // Fallback: simple truncation if AI fails
                text = text.substring(0, 1000) + '...\n[Truncated due to error]';
            }
        }

        return { text };

    } catch (e: any) {
        console.error('File extraction failed:', e);
        return { error: `Extraction failed: ${e.message}` };
    }
}
