'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, SkillOutput } from '@/lib/types';
import { runProjectSkill, deleteProjectOutputAction } from '@/app/actions';
import { StrategyCard, ContextKnob } from '@/components/ui';
import { ArtifactCard } from '@/components/ArtifactCard';
import { Package } from '@geist-ui/icons';
import PresentationGenerator from '../PresentationGenerator';

export function ProjectStrategySection({ project }: { project: Project }) {
    const [strategy, setStrategy] = useState<'presentation' | 'document' | 'pack'>('pack');
    const [activeAudience, setActiveAudience] = useState('Public');
    const [activeStructure, setActiveStructure] = useState('Strategic');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPresentationModal, setShowPresentationModal] = useState(false);
    const router = useRouter();

    // Filter real artifacts from project outputs
    const artifacts = project.outputs?.filter((o: SkillOutput) => o.skillId === 'pack' || o.type === 'pack' || o.type === 'presentation' || o.skillId === 'ppt').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

    const handleGenerate = async () => {
        if (strategy === 'presentation') {
            setShowPresentationModal(true);
            return;
        }

        if (strategy !== 'pack') return;
        setIsGenerating(true);

        try {
            // Pass options to project skill
            const result = await runProjectSkill(project.id, 'pack', {
                audience: activeAudience,
                structure: activeStructure
            });
            if (result && result.error) {
                alert(`Generation Failed: ${result.error}`);
            } else {
                console.log('Generate Pack Success');
                router.refresh();
            }
        } catch (e: any) {
            console.error(e);
            alert(`Failed to generate project pack: ${e.message}`);
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
            // Fallback to copy content
            navigator.clipboard.writeText(artifact.content as string);
            alert('Content copied to clipboard for NotebookLM!');
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '40px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '20px' }}>Strategy & Crystallization</h2>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', justifyContent: 'center' }}>
                <StrategyCard active={strategy === 'pack'} onClick={() => setStrategy('pack')} label="Knowledge Pack" icon={<Package />} />
            </div>

            {/* CONTEXT PARAMETERS (Always visible) */}
            <div style={{ marginBottom: '32px' }}>
                <div className="geist-card" style={{ padding: '24px', background: 'var(--accents-1)', border: 'none', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accents-5)', textAlign: 'center' }}>Target Audience</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                        <div style={{ width: '1px', background: 'var(--accents-2)', alignSelf: 'stretch' }} />
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accents-5)', textAlign: 'center' }}>Structure</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
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

            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="geist-btn"
                    style={{
                        background: 'transparent',
                        color: 'var(--accents-5)',
                        border: '1px solid var(--accents-2)',
                        padding: '0 32px',
                        height: '40px',
                        borderRadius: '999px',
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = '#fff';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--accents-5)';
                        e.currentTarget.style.borderColor = 'var(--accents-2)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    {isGenerating ? 'CRYSTALLIZING...' : (strategy === 'presentation' ? 'OPEN PRESENTATION WIZARD' : `GENERATE ${strategy.toUpperCase()}`)}
                </button>
                {isGenerating && (
                    <div style={{ marginTop: '16px', width: '100%', height: '4px', background: 'var(--accents-2)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#fff', width: '50%', animation: 'progress 2s infinite ease-in-out' }} />
                        <style jsx>{`
                            @keyframes progress {
                                0% { transform: translateX(-100%); }
                                100% { transform: translateX(200%); }
                            }
                        `}</style>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {artifacts.length === 0 && !isGenerating && (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-5)', border: '1px dashed var(--accents-2)', borderRadius: '8px' }}>
                        No project-level artifacts yet.
                    </div>
                )}
                {artifacts.map((artifact) => (
                    <ArtifactCard
                        key={artifact.id}
                        artifact={artifact}
                        onDelete={async (id) => {
                            await deleteProjectOutputAction(project.id, id);
                            router.refresh();
                        }}
                        onShare={handleShare}
                        onDownload={handleDownload}
                    />
                ))}
            </div>

            <PresentationGenerator
                project={project}
                visible={showPresentationModal}
                onClose={() => setShowPresentationModal(false)}
                audience={activeAudience}
                structure={activeStructure}
            />
        </div>
    )
}
