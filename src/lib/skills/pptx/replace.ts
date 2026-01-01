// ROLE: Replace (Writing/Ships)
// Corresponds to: replace.py
// Responsibility: Inject AI-generated content into the Inventory (Shapes).

export class PresentationWriter {
    /**
     * Wrties content into the identified text elements.
     * Matches "replace.py" logic of finding a shape and setting text.
     */
    static replaceText(slide: any, elementId: string, newText: string) {
        // "modifyElement" is the Automizer equivalent of setting text on a shape.
        slide.modifyElement(elementId, [
            (element: any) => {
                // Determine if it's a simple text body or needs clearing
                // Automizer's setText helper handles the XML manipulation.
                // We use the raw setText for simplest replacement.
                if (element.setText) {
                    element.setText(newText);
                } else {
                    // Fallback for different element types if needed
                    const textParam = (node: any) => {
                        node.getElementsByTagName('a:t')[0].textContent = newText;
                    };
                    textParam(element);
                }
            }
        ]);
    }

    /**
     * Smart Fill: Heuristically maps content to available slots.
     * This mimics the AI's "Writing" process filling the available inventory.
     */
    static autoFill(slide: any, inventoryIds: string[], content: { title?: string, bullets?: string[] }) {
        // Sort IDs naturally to guess order (Top-Bottom typically translates to ID order in XML)
        // Disclaimer: XML order isn't always visual order, but decent heuristic.

        // 1. Identify Slots by Name Heuristic (Japanese/English support)
        const lowerIds = inventoryIds.map(id => id.toLowerCase());

        let titleIdIndex = lowerIds.findIndex(id => id.includes('title') || id.includes('タイトル'));
        let bodyIdIndex = lowerIds.findIndex(id => id.includes('content') || id.includes('body') || id.includes('コンテンツ') || id.includes('プレースホルダー'));

        // Fallback: If no explicit title found, default to index 0 (or index 1 if index 0 looks like content)
        if (titleIdIndex === -1) {
            // If ID 0 is content, maybe Title is 1?
            if (bodyIdIndex === 0 && inventoryIds.length > 1) {
                titleIdIndex = 1;
            } else {
                titleIdIndex = 0;
            }
        }

        // Fallback: If no explicit body, pick the one that isn't title
        if (bodyIdIndex === -1 && inventoryIds.length > 1) {
            bodyIdIndex = (titleIdIndex === 0) ? 1 : 0;
        }

        // Apply Title
        if (content.title && titleIdIndex !== -1 && inventoryIds[titleIdIndex]) {
            this.replaceText(slide, inventoryIds[titleIdIndex], content.title);
        }

        // Apply Body
        if (content.bullets && content.bullets.length > 0 && bodyIdIndex !== -1 && inventoryIds[bodyIdIndex]) {
            const bodyText = content.bullets.map(b => `• ${b}`).join('\n');
            this.replaceText(slide, inventoryIds[bodyIdIndex], bodyText);
        }
    }
}
