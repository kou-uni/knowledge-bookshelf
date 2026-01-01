import Automizer from "pptx-automizer";

// ROLE: Rearrange (Configuration/Structure)
// Corresponds to: rearrange.py
// Responsibility: Build the "Skeleton" of the presentation by cloning template slides.

export class PresentationRearranger {
    private automizer: Automizer;

    constructor(automizer: Automizer) {
        this.automizer = automizer;
    }

    /**
     * Clones a specific slide from the template to the output presentation.
     * @param templateName The registered name of the template (e.g., 'template')
     * @param slideIndex The 1-based index of the slide in the template to clone
     * @returns The added slide object for chaining
     */
    addSlide(templateName: string, slideIndex: number, modifier?: (slide: any) => void) {
        // Use the standard callback pattern to modify the slide
        if (modifier) {
            return this.automizer.addSlide(templateName, slideIndex, modifier);
        } else {
            return this.automizer.addSlide(templateName, slideIndex);
        }
    }
}
