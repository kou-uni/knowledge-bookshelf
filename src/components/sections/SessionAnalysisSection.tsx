'use client';

import React from 'react';
import { Session, SkillOutput } from '@/lib/types';
import { runSessionSkill } from '@/app/actions';
import { SkeletonScreen, CopyButton } from '@/components/ui';
import { AnalysisViewer, SubjectiveViewer, formatObjectiveContent } from '@/components/viewers';

export function SessionAnalysisSection({ session, projectId, isAnalyzing, setIsAnalyzing }: {
    session: Session;
    projectId: string;
    isAnalyzing: boolean;
    setIsAnalyzing: (val: boolean) => void;
}) {
    const analysisOutput = session.outputs.find((o: SkillOutput) => o.skillId === 'analyze');

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Simulate waiting for "Loading..." (Skeleton effect)
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = await runSessionSkill(projectId, session.id, 'analyze');
        if (!result.success) alert(result.error);
        setIsAnalyzing(false);
    };

    return (
        <section style={{ marginTop: '80px', borderTop: '1px solid var(--accents-2)', paddingTop: '60px' }}>
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || session.inputs.length === 0}
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
                        transition: 'all 0.2s ease',
                        display: 'block'
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
                    {isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
                </button>
            </div>

            {isAnalyzing && <SkeletonScreen />}

            {
                !isAnalyzing && analysisOutput && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.5s ease' }}>

                        {/* OBJECTIVE SECTION */}
                        <div className="geist-card" style={{ padding: '40px' }}>
                            <h3 style={{
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--accents-5)',
                                marginBottom: '24px',
                                borderBottom: '1px solid var(--accents-2)',
                                paddingBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>Objective Analysis</span>
                                <CopyButton text={formatObjectiveContent(analysisOutput.content as string)} />
                            </h3>
                            <div style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                                {/* Assuming content is a string. If JSON, we'd parse it. Current Mock returns JSON string. */}
                                <AnalysisViewer content={analysisOutput.content as string} />
                            </div>
                        </div>

                        {/* SUBJECTIVE SECTION */}
                        <div className="geist-card" style={{ padding: '40px' }}>
                            <h3 style={{
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: 'var(--accents-5)',
                                marginBottom: '24px',
                                borderBottom: '1px solid var(--accents-2)',
                                paddingBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>Subjective Synthesis</span>
                                <CopyButton text="Reflective synthesis based on the objective structures identified above. (Integration pending)" />
                            </h3>
                            <div style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--accents-6)' }}>
                                <SubjectiveViewer content={analysisOutput.content as string | object} />
                            </div>
                        </div>
                    </div>
                )
            }
        </section>
    )
}
