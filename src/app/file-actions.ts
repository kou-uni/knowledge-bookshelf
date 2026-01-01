'use server';

export async function extractFileText(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) return { error: 'No file provided' };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());

        if (file.type === 'application/pdf') {
            try {
                // Dynamic import to isolate potential loading issues
                // Using pdf-parse which is simpler for text extraction
                const pdf = await import('pdf-parse/lib/pdf-parse.js');
                const data = await pdf.default(buffer);
                return { text: data.text };
            } catch (pdfError: any) {
                console.error('PDF Parse Error:', pdfError);
                return { error: 'PDF parsing failed. The server environment may not support this PDF version.' };
            }
        }

        // Basic text fallback for other allowed types
        if (file.type.startsWith('text/') || file.type === 'application/json' || file.type === 'application/markdown') {
            const text = buffer.toString('utf-8');
            return { text };
        }

        return { error: 'Unsupported file type for extraction. Please copy text manually.' };
    } catch (e: any) {
        console.error('File extraction failed:', e);
        return { error: `Extraction failed: ${e.message}` };
    }
}
