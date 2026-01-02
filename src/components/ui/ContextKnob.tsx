'use client';

import React from 'react';

export function ContextKnob({ label, active, onClick }: { label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                color: active ? '#fff' : 'var(--accents-5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--accents-5)';
            }}
        >
            {label}
        </button>
    )
}
