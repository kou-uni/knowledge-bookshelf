import Automizer from "pptx-automizer";
import { runLLM } from './base';
import { Project } from '../types';
import { PresentationRearranger } from './pptx/rearrange';
import { PresentationInventory } from './pptx/inventory';
import { PresentationWriter } from './pptx/replace';

// 1. STRATEGIST AGENT: Generate Agenda (Unchanged Logic)
export interface AgendaItem {
    id: string;
    sectionTitle: string;
    slides: {
        title: string;
        topic: string;
        bullets?: string[];
        speakerNotes?: string;
        layout?: "Title" | "Content";
    }[];
}

export interface Agenda {
    title: string;
    items: AgendaItem[];
}

export async function generatePresentationAgenda(project: Project, constraints: { audience: string, structure: string }): Promise<Agenda> {
    const inputSummary = project.sessions.map(s =>
        `Session ${s.sessionNumber}: ${s.title}\nInputs: ${s.inputs.map(i => i.title).join(', ')}`
    ).join('\n');

    const prompt = `You are a Presentation Strategist. Create a detailed PowerPoint Agenda for a project titled "${project.title}".
    
    CONTEXT:
    Audience: ${constraints.audience}
    Structure: ${constraints.structure}
    
    PROJECT CURRICULUM:
    ${inputSummary}

    REQUIREMENTS:
    - Create 4-8 sections.
    - For each section, define 1-3 specific slides.
    
    OUTPUT FORMAT (JSON ONLY):
    {
        "title": "Presentation Title",
        "items": [
            {
                "id": "1",
                "sectionTitle": "Introduction",
                "slides": [
                    { "title": "Overview", "topic": "Goals", "layout": "Content" }
                ]
            }
        ]
    }
    `;

    const response = await runLLM(prompt, "Generate the JSON agenda now.");
    try {
        const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse agenda JSON", response);
        throw new Error("Failed to generate agenda");
    }
}

// 2. WRITER AGENT (Unchanged Logic)
export interface SlideContent {
    title: string;
    bullets: string[];
    speakerNotes: string;
    layout: "Title" | "Content";
}

export async function generateSlideContent(slideTitle: string, slideTopic: string, context: string, project: Project): Promise<SlideContent> {
    const contextData = project.sessions.flatMap(s => s.inputs.map(i => `${i.title}: ${i.content.substring(0, 200)}...`)).join('\n');
    const prompt = `Write content for slide: "${slideTitle}" (Topic: ${slideTopic}).
    Context: ${contextData}
    Return JSON: { "title": "${slideTitle}", "bullets": ["Point 1", "Point 2"], "speakerNotes": "...", "layout": "Content" }`;

    const response = await runLLM(prompt, "JSON only.");
    try {
        const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        return { title: slideTitle, bullets: ["Generation Failed"], speakerNotes: "", layout: "Content" };
    }
}

// 3. ARTISAN AGENT: Structure (Rearrange) -> Analyze (Inventory) -> Write (Replace)
export async function renderPowerPoint(agenda: Agenda, templatePath: string): Promise<string> {
    const automizer = new Automizer({
        templateDir: '/tmp',
        outputDir: '/tmp'
    });

    // 1. Load Template (The "Library")
    automizer
        .loadRoot(templatePath)
        .load(templatePath, 'template');

    const rearranger = new PresentationRearranger(automizer);

    // 2. Execute Strategy (Rearrange & Write)
    // We assume Template Slide 1 = Title, Slide 2 = Content (as per User's template convention)

    // Title Slide (Clone Slide 1)
    rearrangeAndWrite(rearranger, 1, {
        title: agenda.title,
        bullets: []
    });

    // Content Slides (Clone Slide 2)
    for (const item of agenda.items) {
        for (const slideContent of item.slides) {
            rearrangeAndWrite(rearranger, 2, slideContent);
        }
    }

    const outputName = `generated_${Date.now()}.pptx`;
    await automizer.write(outputName);
    return `/tmp/${outputName}`; // Return absolute path so API can find it
}

// Helper to bridge the Roles inside Automizer's callback structure
// This helper coordinates the "Analyst" (Inventory) and "Writer" (Replace) roles
function rearrangeAndWrite(rearranger: PresentationRearranger, templateSlideIdx: number, content: any) {
    rearranger.addSlide('template', templateSlideIdx, async (helper) => {
        // ROLE: Inventory (Analysis) - Find where we can write
        const inventoryIds = await PresentationInventory.scanSlide(helper);

        // ROLE: Replace (Writing) - Write to the found places
        PresentationWriter.autoFill(helper, inventoryIds, content);
    });
}
