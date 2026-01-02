'use client';

import React, { useState } from 'react';
import { Project, SkillOutput } from '@/lib/types';
import { runProjectSkill } from '@/app/actions';
import { SkeletonScreen, CopyButton } from '@/components/ui';
import { AnalysisViewer, SubjectiveViewer, formatObjectiveContent } from '@/components/viewers';

export function ProjectAnalyticsSection({ project }: { project: Project }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const totalInputs = project.sessions.reduce((acc, s) => acc + s.inputs.length, 0);

    // Find project-level analysis output (skillId 'analyze')
    // Project outputs are stored in `project.outputs`
    const analysisOutput = project.outputs?.find((o: SkillOutput) => o.skillId === 'analyze');

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Skeleton Law: visible flicker
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = await runProjectSkill(project.id, 'analyze');
        if (result && result.error) {
            alert(`Analysis Failed: ${result.error}`);
        }
        setIsAnalyzing(false);
    };

    return (
        <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '40px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '20px' }}>Project Analytics</h2>

            {/* Structural Analysis */}
            <section style={{ paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px' }}>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || totalInputs === 0}
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
                        {isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
                    </button>
                </div>

                {isAnalyzing && <SkeletonScreen />}

                {!isAnalyzing && analysisOutput && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeIn 0.5s ease' }}>
                        {/* OBJECTIVE SECTION */}
                        <div className="geist-card" style={{ padding: '40px', border: '1px solid var(--accents-2)', borderRadius: '8px' }}>
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
                                <AnalysisViewer content={analysisOutput.content as string} />
                            </div>
                        </div>

                        {/* SUBJECTIVE SECTION */}
                        <div className="geist-card" style={{ padding: '40px', border: '1px solid var(--accents-2)', borderRadius: '8px' }}>
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
                )}
            </section>
        </div>
    )
}
