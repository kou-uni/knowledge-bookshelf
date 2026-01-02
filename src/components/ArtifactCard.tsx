'use client';

import { useTransition, useState } from 'react';
import { SkillOutput } from '@/lib/types';
import { Package, Monitor, Share, Download } from '@geist-ui/icons';

interface ArtifactCardProps {
    artifact: SkillOutput;
    onDelete: (id: string) => Promise<void>;
    onShare: (a: SkillOutput) => void;
    onDownload: (a: SkillOutput) => void;
}

export function ArtifactCard({ artifact, onDelete, onShare, onDownload }: ArtifactCardProps) {
    const [isDeleting, startDelete] = useTransition();
    const [isConfirming, setIsConfirming] = useState(false);

    return (
        <div className="geist-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', animation: 'fadeIn 0.5s ease', position: 'relative' }}>
            {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isConfirming) {
                        startDelete(async () => {
                            await onDelete(artifact.id);
                        });
                    } else {
                        setIsConfirming(true);
                    }
                }}
                onMouseLeave={() => isConfirming && setIsConfirming(false)}
                disabled={isDeleting}
                style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: isConfirming ? '#ff0000' : 'var(--accents-2)',
                    border: '1px solid #fff',
                    borderRadius: '50%',
                    width: isConfirming ? 'auto' : '24px',
                    height: '24px',
                    cursor: 'pointer',
                    color: isConfirming ? '#fff' : 'var(--accents-5)',
                    zIndex: 10,
                    padding: isConfirming ? '0 8px' : '0',
                    fontSize: isConfirming ? '0.65rem' : '14px',
                    transition: 'all 0.2s ease',
                    fontWeight: isConfirming ? 600 : 400,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                {isConfirming ? (isDeleting ? '...' : 'DELETE?') : '✕'}
            </button>

            <div style={{
                width: '40px', height: '40px',
                background: artifact.type === 'pack' ? '#000' : '#fff',
                color: artifact.type === 'pack' ? '#fff' : '#000',
                border: '1px solid var(--accents-2)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {artifact.type === 'pack' ? <Package size={20} /> : <Monitor size={20} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artifact.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accents-4)' }}>
                    <span suppressHydrationWarning>{new Date(artifact.createdAt).toLocaleDateString()}</span> • MARKDOWN
                </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
                <button
                    onClick={() => onShare(artifact)}
                    title="Share / Copy for NotebookLM"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accents-4)', padding: '8px' }}
                >
                    <Share size={20} />
                </button>
                <button
                    onClick={() => onDownload(artifact)}
                    title="Download Markdown"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accents-4)', padding: '8px' }}
                >
                    <Download size={20} />
                </button>
            </div>
        </div>
    );
}
