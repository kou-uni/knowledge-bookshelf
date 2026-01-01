import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to /tmp for Automizer to read
        // Add timestamp to avoid collisions
        const fileName = `template_${Date.now()}_${file.name}`;
        const filePath = join('/tmp', fileName);

        await writeFile(filePath, buffer);

        return NextResponse.json({ success: true, filePath, fileName });
    } catch (e: any) {
        console.error("Upload Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
