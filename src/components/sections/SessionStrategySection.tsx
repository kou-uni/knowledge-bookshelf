'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Session, SkillOutput } from '@/lib/types';
import { runSessionSkill, deleteSessionOutputAction } from '@/app/actions';
import { ArtifactCard } from '@/components/ArtifactCard';
import { StrategyCard, ContextKnob } from '@/components/ui';
import { Archive, Package } from '@geist-ui/icons';

// Renamed from OutputSection to SessionStrategySection for consistency
export function SessionStrategySection({ project, session, isPending }: { project: Project, session: Session, isPending?: boolean }) {
    const router = useRouter();
    const [strategy, setStrategy] = useState<'presentation' | 'document' | 'pack'>('pack');
    const [activeAudience, setActiveAudience] = useState('Public');
    const [activeStructure, setActiveStructure] = useState('Strategic');
    const [isGenerating, setIsGenerating] = useState(false);

    // Filter real artifacts from session outputs
    const artifacts = session.outputs.filter((o: SkillOutput) => o.skillId === 'pack' || o.type === 'pack').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleCrystallize = async () => {
        if (strategy !== 'pack') return; // Only pack is implemented
        setIsGenerating(true);
        try {
            // Pass context options to the skill
            const result = await runSessionSkill(project.id, session.id, 'pack', {
                audience: activeAudience,
                structure: activeStructure
            });
            if (result && result.error) {
                alert(`Generation Failed: ${result.error}`);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to generate pack');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = (artifact: SkillOutput) => {
        const blob = new Blob([artifact.content as string], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${artifact.title}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleShare = async (artifact: SkillOutput) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: artifact.title,
                    text: artifact.content as string,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(artifact.content as string);
            alert('Content copied to clipboard for NotebookLM!');
        }
    };

    return (
        <section style={{ marginTop: '80px', borderTop: '1px solid var(--accents-2)', paddingTop: '60px', paddingBottom: '120px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 className="variant-section" style={{ marginBottom: '8px' }}>Strategy</h2>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>

                {/* STRATEGY & WORKBENCH */}
                <div>
                    {/* 1. STRATEGY SELECTOR */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', justifyContent: 'center' }}>
                        <StrategyCard
                            active={strategy === 'pack'}
                            onClick={() => setStrategy('pack')}
                            icon={<Package />}
                            label="Knowledge Pack"
                        />
                    </div>

                    {/* 2. CONTEXT PARAMETERS (Centered with Divider) */}
                    <div style={{ marginBottom: '32px' }}>
                        <div className="geist-card" style={{ padding: '24px', background: 'var(--accents-1)', border: 'none' }}>
                            <div className="context-container" style={{ display: 'flex', gap: '24px', alignItems: 'stretch', flexWrap: 'nowrap' }}>
                                {/* Left: Audience */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <label className="variant-label" style={{ display: 'block', marginBottom: '12px' }}>Target Audience</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
                                        {['Executive', 'Public', 'Self'].map(audience => (
                                            <ContextKnob
                                                key={audience}
                                                label={audience}
                                                active={activeAudience === audience}
                                                onClick={() => setActiveAudience(audience)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Center Divider */}
                                <div className="context-divider" style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />

                                {/* Right: Structure */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <label className="variant-label" style={{ display: 'block', marginBottom: '12px' }}>Structure</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
                                        {['Technical', 'Strategic', 'Educational'].map(structure => (
                                            <ContextKnob
                                                key={structure}
                                                label={structure}
                                                active={activeStructure === structure}
                                                onClick={() => setActiveStructure(structure)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. CRYSTALLIZE ACTION */}
                    <div>
                        <button
                            onClick={handleCrystallize}
                            disabled={isGenerating}
                            className="geist-btn"
                            style={{
                                background: 'transparent',
                                color: '#fff',
                                border: '1px solid var(--accents-2)',
                                width: '100%',
                                height: '56px',
                                fontSize: '1rem',
                                letterSpacing: '0.1em',
                                borderRadius: '999px',
                                transition: 'all 0.2s',
                                opacity: isGenerating ? 0.7 : 1,
                                cursor: 'pointer',
                                fontWeight: 400
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.borderColor = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'var(--accents-2)';
                            }}
                        >
                            {isGenerating ? 'CRYSTALLIZING...' : `GENERATE ${strategy.toUpperCase()}`}
                        </button>
                        {isGenerating && (
                            <div style={{ marginTop: '16px', width: '100%', height: '4px', background: 'var(--accents-2)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#000', width: '50%', animation: 'progress 2s infinite ease-in-out' }} />
                                <style jsx>{`
                                    @keyframes progress {
                                        0% { transform: translateX(-100%); }
                                        100% { transform: translateX(200%); }
                                    }
                                `}</style>
                            </div>
                        )}
                    </div>
                </div>

                {/* ARTIFACT GALLERY */}
                <div>
                    <h3 className="variant-label" style={{ marginBottom: '24px' }}>Artifacts</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {artifacts.length === 0 && (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-4)', border: '1px dashed var(--accents-3)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                                <Archive size={32} />
                                <p style={{ fontSize: '0.875rem', marginTop: '12px' }}>No artifacts crystallized yet.</p>
                            </div>
                        )}
                        {artifacts.map((artifact: SkillOutput) => (
                            <ArtifactCard
                                key={artifact.id}
                                artifact={artifact}
                                onDelete={async (id) => {
                                    const result = await deleteSessionOutputAction(project.id, session.id, id);
                                    if (!result.success) alert(result.error);
                                    router.refresh();
                                }}
                                onShare={handleShare}
                                onDownload={handleDownload}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div style={{ marginTop: '120px', borderTop: '1px solid var(--accents-2)', paddingTop: '40px', textAlign: 'center', paddingBottom: '40px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accents-4)', letterSpacing: '0.1em' }}>powered by uni**</p>
            </div>
        </section>
    );
}
