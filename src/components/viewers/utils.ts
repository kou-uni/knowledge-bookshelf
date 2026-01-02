export function safeParseAnalysis(content: string | object) {
    if (typeof content === 'object' && content !== null) return content;
    try {
        const parsed = JSON.parse(content as string);
        // Double parse check (if the DB stored it as a stringified string)
        if (typeof parsed === 'string') {
            try { return JSON.parse(parsed); } catch { return parsed; }
        }
        return parsed;
    } catch {
        return null;
    }
}

export function formatObjectiveContent(content: string | object): string {
    const data = safeParseAnalysis(content);
    if (data && data.objective) {
        let output = '';
        if (data.objective.concepts) output += 'Key Concepts:\n' + data.objective.concepts.join(', ') + '\n\n';
        if (data.objective.frameworks) output += 'Frameworks:\n' + data.objective.frameworks.map((f: string) => '- ' + f).join('\n') + '\n\n';
        if (data.objective.evidence) output += 'Evidence:\n' + data.objective.evidence.map((f: string) => '- ' + f).join('\n');
        return output.trim();
    }
    return typeof content === 'string' ? content : JSON.stringify(content);
}
