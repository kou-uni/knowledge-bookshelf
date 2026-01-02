'use client';

import React from 'react';
import { safeParseAnalysis } from './utils';

export function SubjectiveViewer({ content }: { content: string | object }) {
    const data = safeParseAnalysis(content);
    if (!data || !data.subjective) {
        return <p style={{ color: 'var(--accents-5)' }}>No subjective analysis available.</p>;
    }

    const { observation, interpretation, application } = data.subjective;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {observation && (
                <div>
                    <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--accents-5)' }}>OBSERVATION</strong>
                    <p style={{ margin: 0 }}>{observation}</p>
                </div>
            )}
            {interpretation && (
                <div>
                    <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--accents-5)' }}>INTERPRETATION</strong>
                    <p style={{ margin: 0 }}>{interpretation}</p>
                </div>
            )}
            {application && (
                <div>
                    <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--accents-5)' }}>APPLICATION</strong>
                    <p style={{ margin: 0 }}>{application}</p>
                </div>
            )}
        </div>
    );
}
