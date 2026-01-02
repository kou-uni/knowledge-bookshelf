'use client';

import React, { useState } from 'react';
import { Check, Clipboard } from '@geist-ui/icons';

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            title="Copy to clipboard"
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: copied ? '#000' : 'var(--accents-3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {copied ? <Check size={16} /> : <Clipboard size={16} />}
        </button>
    )
}
