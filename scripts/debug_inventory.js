
const Automizer = require('pptx-automizer').default; // Check if default export is needed
const path = require('path');
const fs = require('fs');

async function debugInventory() {
    const templatePath = "/Users/minanspark/Downloads/uniのテンプレート.pptx";
    const automizer = new Automizer({
        templateDir: '/tmp',
        outputDir: '/tmp'
    });

    console.log("Loading Template:", templatePath);

    try {
        const pres = automizer
            .loadRoot(templatePath)
            .load(templatePath, 'template');

        console.log("Template Loaded. Inspecting Slide 1...");

        // Inspect Slide 1 (Title?)
        pres.addSlide('template', 1, (slide) => {
            console.log("--- Slide 1 Inventory ---");
            slide.getAllTextElementIds().then(ids => {
                console.log("IDs found:", ids);
            }).catch(e => console.error(e));
        });

        // Inspect Slide 2 (Content?)
        pres.addSlide('template', 2, (slide) => {
            console.log("--- Slide 2 Inventory ---");
            slide.getAllTextElementIds().then(ids => {
                console.log("IDs found:", ids);
            }).catch(e => console.error(e));
        });

        // We need to write to trigger the callback execution
        await pres.write(`debug_${Date.now()}.pptx`);
        console.log("Debug write complete.");

    } catch (e) {
        console.error("Debug Failed:", e);
    }
}

debugInventory();
