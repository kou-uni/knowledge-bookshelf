import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '../../../lib/services';
import { generatePresentationAgenda, renderPowerPoint, generateSlideContent, Agenda } from '../../../lib/skills/presentation';

// POST /api/generate-ppt
// Body: { action: 'agenda' | 'content' | 'render', projectId: string, params: ... }

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, projectId } = body;
        const { projectService } = getServices();
        const project = await projectService.getProject(projectId);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        if (action === 'agenda') {
            const { audience, structure } = body.params;
            const agenda = await generatePresentationAgenda(project, { audience, structure });
            return NextResponse.json({ agenda });
        }

        if (action === 'content') {
            // Generate content for a single slide (Parallelizable by client)
            const { slideTitle, slideTopic, context } = body.params;
            const content = await generateSlideContent(slideTitle, slideTopic, context, project);
            return NextResponse.json({ content });
        }

        if (action === 'render') {
            const { fullAgenda, templateBase64, templatePath } = body.params;
            let targetTemplatePath = templatePath;

            const fs = require('fs/promises');

            // Fallback for Vercel: Use Base64 if provided (Stateless compatibility)
            if (templateBase64) {
                const buffer = Buffer.from(templateBase64, 'base64');
                const tempPath = `/tmp/template_${Date.now()}.pptx`;
                await fs.writeFile(tempPath, buffer);
                targetTemplatePath = tempPath;
            }

            if (!targetTemplatePath) {
                return NextResponse.json({ error: "No template provided" }, { status: 400 });
            }

            // Generate File (returns absolute path)
            const generatedFilePath = await renderPowerPoint(fullAgenda as unknown as Agenda, targetTemplatePath);
            console.log("PPT Generation Complete. Reading from:", generatedFilePath);

            // Read the generated file to Buffer
            const outputBuffer = await fs.readFile(generatedFilePath);

            // Cleanup (Optional but good practice)
            try {
                // await fs.unlink(targetTemplatePath); // Keep for debug if needed
                // await fs.unlink(generatedFilePath);
            } catch (e) { /* ignore */ }

            // Return Binary
            return new NextResponse(outputBuffer, {
                headers: {
                    'Content-Disposition': 'attachment; filename="Master_Presentation_v2.pptx"',
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                }
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (e: any) {
        console.error("Generate PPT Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
