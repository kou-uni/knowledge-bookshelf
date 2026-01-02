'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { safeParseAnalysis } from './utils';

export function AnalysisViewer({ content }: { content: string | object }) {
    const data = safeParseAnalysis(content);

    if (!data || !data.objective) {
        return <ReactMarkdown>{typeof content === 'string' ? content : JSON.stringify(content)}</ReactMarkdown>;
    }

    return (
        <div>
            {data.objective && (
                <>
                    {data.objective.concepts && (
                        <div style={{ marginBottom: '24px' }}>
                            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Key Concepts</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {data.objective.concepts.map((c: string, i: number) => (
                                    <span key={i} style={{ background: 'var(--accents-1)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>{c}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.objective.frameworks && (
                        <div>
                            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Frameworks</strong>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                {data.objective.frameworks.map((f: string, i: number) => (
                                    <li key={i} style={{ marginBottom: '4px' }}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {data.objective.evidence && (
                        <div style={{ marginTop: '24px' }}>
                            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Evidence</strong>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                {data.objective.evidence.map((e: string, i: number) => (
                                    <li key={i} style={{ marginBottom: '4px' }}>{e}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
