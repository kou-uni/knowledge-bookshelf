'use client';

import React from 'react';

interface StrategyCardProps {
    active: boolean;
    onClick?: () => void;
    label: string;
    icon?: React.ReactNode;
    comingSoon?: boolean;
}

export function StrategyCard({ active, onClick, label, icon, comingSoon }: StrategyCardProps) {
    return (
        <button
            onClick={comingSoon ? undefined : onClick}
            disabled={comingSoon}
            style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? '#fff' : (comingSoon ? 'var(--accents-3)' : 'var(--accents-5)'),
                border: 'none',
                borderRadius: '999px',
                padding: '8px 24px',
                cursor: comingSoon ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                opacity: comingSoon ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
                if (!active && !comingSoon) e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                if (!active && !comingSoon) e.currentTarget.style.color = 'var(--accents-5)';
            }}
        >
            {icon && <span>{icon}</span>}
            {label}
            {comingSoon && (
                <span style={{
                    fontSize: '0.6rem',
                    background: 'var(--accents-2)',
                    color: 'var(--accents-5)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginLeft: '4px',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                }}>
                    SOON
                </span>
            )}
        </button>
    )
}
