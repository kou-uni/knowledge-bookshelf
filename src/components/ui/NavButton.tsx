'use client';

import React from 'react';

export function NavButton({ label, targetId }: { label: string, targetId: string }) {
    return (
        <button
            onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 400,
                color: 'var(--accents-6)',
                padding: '8px 20px',
                borderRadius: '999px',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accents-6)';
                e.currentTarget.style.background = 'transparent';
            }}
        >
            {label}
        </button>
    )
}
