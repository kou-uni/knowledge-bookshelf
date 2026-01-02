'use client';

import React from 'react';

export function SkeletonScreen() {
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="geist-card" style={{ padding: '40px', height: '300px', background: '#111', animation: 'pulse 2s infinite ease-in-out', border: '1px solid var(--accents-2)' }}>
                <div style={{ width: '30%', height: '20px', background: 'var(--accents-2)', marginBottom: '30px', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '16px', background: 'var(--accents-2)', marginBottom: '12px', borderRadius: '4px' }} />
                <div style={{ width: '90%', height: '16px', background: 'var(--accents-2)', marginBottom: '12px', borderRadius: '4px' }} />
                <div style={{ width: '95%', height: '16px', background: 'var(--accents-2)', marginBottom: '12px', borderRadius: '4px' }} />
            </div>
            <div className="geist-card" style={{ padding: '40px', height: '200px', background: '#111', animation: 'pulse 2s infinite ease-in-out', animationDelay: '0.2s', border: '1px solid var(--accents-2)' }}>
                <div style={{ width: '30%', height: '20px', background: 'var(--accents-2)', marginBottom: '30px', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '16px', background: 'var(--accents-2)', marginBottom: '12px', borderRadius: '4px' }} />
            </div>
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
             `}</style>
        </div>
    )
}
