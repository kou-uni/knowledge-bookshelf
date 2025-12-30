'use client';

import { Project, Session, OutputType } from '@/lib/types';
import { addSessionInput, runSessionSkill } from '@/app/actions';
import { useState, useTransition } from 'react';
import Link from 'next/link';

// Helper to display Analysis JSON nicely
function AnalysisViewer({ content }: { content: string }) {
    let data;
    try {
        data = JSON.parse(content);
    } catch {
        return <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{content}</pre>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Objective */}
            <div style={{ border: '1px solid var(--accents-2)', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 300, color: 'var(--accents-5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Structural Analysis (Objective)
                </h4>

                <div style={{ marginBottom: '16px' }}>
                    <strong style={{ fontWeight: 400, color: 'var(--geist-foreground)' }}>CONCEPTS</strong>
                    <ul style={{ paddingLeft: '20px', margin: '4px 0', color: 'var(--accents-5)' }}>
                        {data.objective?.concepts?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <strong style={{ fontWeight: 400, color: 'var(--geist-foreground)' }}>FRAMEWORKS</strong>
                    <ul style={{ paddingLeft: '20px', margin: '4px 0', color: 'var(--accents-5)' }}>
                        {data.objective?.frameworks?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                </div>
            </div>

            {/* Subjective */}
            <div style={{ border: '1px solid var(--accents-2)', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 300, color: 'var(--accents-5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Reflective Cycle (Subjective)
                </h4>

                <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontWeight: 400 }}>OBSERVATION (What?)</strong>
                    <p style={{ margin: '4px 0', color: 'var(--accents-5)', fontSize: '0.95rem' }}>{data.subjective?.observation}</p>
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontWeight: 400 }}>INTERPRETATION (So What?)</strong>
                    <p style={{ margin: '4px 0', color: 'var(--accents-5)', fontSize: '0.95rem' }}>{data.subjective?.interpretation}</p>
                </div>
                <div>
                    <strong style={{ fontWeight: 400 }}>APPLICATION (Now What?)</strong>
                    <p style={{ margin: '4px 0', color: 'var(--accents-5)', fontSize: '0.95rem' }}>{data.subjective?.application}</p>
                </div>
            </div>
        </div>
    );
}

export function SessionClient({ project, session }: { project: Project; session: Session }) {
    const [isAdding, setIsAdding] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleRunSkill = (skillId: string) => {
        startTransition(async () => {
            await runSessionSkill(project.id, session.id, skillId);
        });
    };

    const handleDeleteInput = (inputId: string) => {
        if (confirm('Delete this input?')) {
            startTransition(async () => {
                await deleteSessionInputAction(project.id, session.id, inputId);
            });
        }
    };

    const inputs = session.inputs;
    const analyses = session.outputs.filter(o => o.type === 'analysis');
    const outputs = session.outputs.filter(o => o.type !== 'analysis');

    return (
        <div className="geist-container" style={{ paddingBottom: '120px' }}>

            {/* 1. INPUTS */}
            <section style={{ marginBottom: '60px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 200, letterSpacing: '0.05em' }}>01 INPUT</h2>
                    {!isAdding && (
                        <button onClick={() => setIsAdding(true)} className="geist-btn secondary" style={{ height: '32px', fontSize: '0.8rem' }}>
                            + ADD SOURCE
                        </button>
                    )}
                </header>

                {isAdding && (
                    <InputManager
                        projectId={project.id}
                        sessionId={session.id}
                        onCancel={() => setIsAdding(false)}
                    />
                )}

                {inputs.length === 0 && !isAdding ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accents-5)', border: '1px dashed var(--accents-2)' }}>
                        No inputs yet. Add notes, voice, or files to begin.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {inputs.map(input => (
                            <div key={input.id} className="geist-card" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => handleDeleteInput(input.id)}
                                    style={{
                                        position: 'absolute', top: '16px', right: '16px',
                                        background: 'transparent', border: 'none',
                                        color: 'var(--accents-3)', cursor: 'pointer', fontSize: '1.2rem'
                                    }}
                                >
                                    ×
                                </button>
                                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accents-4)', border: '1px solid var(--accents-2)', padding: '2px 6px', borderRadius: '4px' }}>{input.type}</span>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 300 }}>{input.title}</h4>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--accents-5)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {input.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 2. ANALYZE */}
            <section style={{ marginBottom: '60px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 200, letterSpacing: '0.05em' }}>02 ANALYZE</h2>
                    <button
                        onClick={() => handleRunSkill('analyze')}
                        disabled={isPending || inputs.length === 0}
                        className="geist-btn"
                        style={{ height: '32px', fontSize: '0.8rem' }}
                    >
                        {isPending ? 'ANALYZING...' : 'RUN STRUCTURAL ANALYSIS'}
                    </button>
                </header>

                <div style={{ minHeight: '100px' }}>
                    {analyses.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accents-5)', background: 'var(--accents-1)', borderRadius: '8px' }}>
                            {/* Empty state as requested */}
                        </div>
                    ) : (
                        <div style={{ animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                            <style jsx>{`
                                @keyframes slideUp {
                                    from { opacity: 0; transform: translateY(20px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                            `}</style>
                            {analyses.map(analysis => (
                                <div key={analysis.id}>
                                    <AnalysisViewer content={analysis.content as string} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* 3. OUTPUT */}
            <section>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '12px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 200, letterSpacing: '0.05em' }}>03 OUTPUT</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Instruction Template Button */}
                        <Link href={`/projects/${project.id}/sessions/${session.id}/templates`} className="geist-btn secondary" style={{ height: '32px', fontSize: '0.8rem', marginRight: '16px', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            INSTRUCTION TEMPLATES
                        </Link>

                        <button onClick={() => handleRunSkill('summarize')} disabled={isPending} className="geist-btn secondary" style={{ height: '32px', fontSize: '0.8rem' }}>
                            GENERATE REPORT
                        </button>
                    </div>
                </header>

                {/* Instruction Area */}
                <div className="geist-card" style={{ marginBottom: '24px', padding: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.8rem', color: 'var(--accents-5)' }}>CUSTOM INSTRUCTION</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <textarea
                            className="geist-input"
                            placeholder="Describe how you want the output formatted..."
                            rows={2}
                            style={{ flex: 1, resize: 'none' }}
                        />
                        <button className="geist-btn" style={{ height: 'auto' }}>
                            GENERATE
                        </button>
                    </div>
                </div>

                {outputs.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accents-5)', background: 'var(--accents-1)' }}>
                        No final artifacts generated.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {outputs.map(output => (
                            <div key={output.id} className="geist-card">
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 300, color: 'var(--geist-violet)' }}>{output.title}</h4>
                                {output.type === 'ppt' ? (
                                    <a href={output.content as string} download={output.title} className="geist-btn" style={{ width: '100%', marginTop: '16px' }}>
                                        ↓ DOWNLOAD PPTX
                                    </a>
                                ) : (
                                    <div style={{ fontSize: '0.9rem', color: 'var(--accents-5)', maxHeight: '150px', overflowY: 'auto' }}>
                                        {typeof output.content === 'string' ? output.content : 'Data'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}

import { deleteSessionInputAction } from '@/app/actions';
import { InputManager } from '@/components/InputManager';
