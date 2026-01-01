
// Using CommonJS require to avoid ESM issues
const { renderPowerPoint } = require('../src/lib/skills/presentation');
const path = require('path');
const fs = require('fs');

// Mock Data
const mockAgenda = {
    title: "Verification Presentation",
    items: [
        {
            id: "1",
            sectionTitle: "Test Section",
            slides: [
                {
                    title: "Slide 1",
                    topic: "Verification",
                    bullets: ["Bullet 1", "Bullet 2"],
                    speakerNotes: "Notes",
                    layout: "Content"
                }
            ]
        }
    ]
};

const templatePath = "/Users/minanspark/Downloads/uniのテンプレート.pptx";

async function runTest() {
    console.log("Starting PPTX Generation Test...");
    console.log("Template:", templatePath);

    if (!fs.existsSync(templatePath)) {
        console.error("Template file not found!");
        process.exit(1);
    }

    try {
        const outputPath = await renderPowerPoint(mockAgenda, templatePath);
        console.log("Success! Output generated at:", outputPath);

        const stats = fs.statSync(outputPath);
        console.log("Output Size:", stats.size, "bytes");

        if (stats.size > 0) {
            console.log("Verification Passed: File created and has content.");
        } else {
            console.error("Verification Failed: File is empty.");
            process.exit(1);
        }

    } catch (e) {
        console.error("Verification Failed with Error:", e);
        process.exit(1);
    }
}

runTest();
