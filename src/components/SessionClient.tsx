'use client';

import { Project, Session, KnowledgeInput, SkillOutput } from '@/lib/types';
import { useState, useTransition } from 'react';
import { FileText, Mic, Image, Type, Clipboard, Check, Monitor, Package, Download, Layout, Archive, Share } from '@geist-ui/icons';
import { addSessionInput, deleteSessionInputAction, runSessionSkill } from '@/app/actions';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { InlineTextEdit } from './InlineTextEdit';
import { InputManager } from './InputManager';
import { updateSessionAction, analyzeInputAction, deleteSessionOutputAction } from '@/app/actions';
import { KnowledgeList } from './KnowledgeList';
import { KnowledgeItem } from '@/lib/types';
import { ArtifactCard } from './ArtifactCard';
import { NavButton, ContextKnob, StrategyCard, SkeletonScreen, CopyButton } from '@/components/ui';
import { AnalysisViewer, SubjectiveViewer, formatObjectiveContent } from '@/components/viewers';
import { SessionStrategySection, SessionAnalysisSection } from '@/components/sections';

export function SessionClient({ project, session }: { project: Project; session: Session }) {
    const [isPending, startTransition] = useTransition();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    return (
        <main className="geist-container" style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '60px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', marginBottom: '32px', color: 'var(--accents-5)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>DASHBOARD</Link>
                    <span style={{ opacity: 0.5 }}>/</span>
                    <Link href={`/projects/${project.id}`} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>{project.title.toUpperCase()}</Link>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '16px', marginBottom: '24px' }}>
                    <InlineTextEdit
                        initialValue={session.title}
                        onSave={async (val) => {
                            const result = await updateSessionAction(project.id, session.id, { title: val });
                            if (!result.success) alert(result.error);
                        }}
                        className="variant-hero"
                        placeholder="Session Title"
                        style={{ textAlign: 'left', width: '100%', fontSize: '4.5rem', lineHeight: '1' }}
                        containerStyle={{ justifyContent: 'flex-start', width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '32px', justifyContent: 'flex-start' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accents-5)' }}>
                        {session.date ? session.date : 'No Date'}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--accents-5)' }}>
                        {session.inputs.length} SOURCES
                    </span>
                </div>
            </header>



            {/* Navigation */}
            {/* Navigation */}
            <nav className="glass-dock" style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '60px',
                position: 'sticky',
                top: '20px',
                zIndex: 100,
                padding: '8px',
                borderRadius: '999px',
                width: 'fit-content',
                margin: '0 auto 60px auto'
            }}>
                <NavButton label="INPUT" targetId="section-input" />
                <NavButton label="ANALYTICS" targetId="section-analysis" />
                <NavButton label="STRATEGY" targetId="section-strategy" />
            </nav>

            <div id="section-input" style={{ scrollMarginTop: '100px' }}>
                <h2 className="variant-section" style={{ marginBottom: '32px', display: 'block', color: '#fff' }}>Input Sources</h2>
                <InputManager
                    projectId={project.id}
                    sessionId={session.id}
                    onCancel={() => { }}
                />

                <section style={{ marginTop: '60px' }}>
                    {session.inputs.map(input => (
                        <InputCard
                            key={input.id}
                            input={input}
                            projectId={project.id}
                            sessionId={session.id}
                            knowledgeItems={session.knowledgeItems}
                        />
                    ))}
                </section>
            </div>

            <div id="section-analysis" style={{ scrollMarginTop: '100px' }}>
                <SessionAnalysisSection
                    session={session}
                    projectId={project.id}
                    isAnalyzing={isAnalyzing}
                    setIsAnalyzing={setIsAnalyzing}
                />
            </div>

            <div id="section-strategy" style={{ scrollMarginTop: '100px' }}>
                <SessionStrategySection project={project} session={session} isPending={isPending} />
            </div>

            <style jsx global>{`
                .variant-hero { font-size: 3rem; font-weight: 100; letter-spacing: -0.05em; line-height: 1.1; color: #fff; }
                .variant-section { font-size: 2rem; font-weight: 200; letter-spacing: 0; color: #fff; }
                .variant-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accents-5); }
                .variant-card-title { font-size: 1.25rem; font-weight: 500; letter-spacing: -0.02em; }
                .glass-dock {
                    backdrop-filter: blur(20px);
                    background: rgba(255,255,255,0.7);
                    border: 1px solid var(--accents-2);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
                }
                .alchemy-card {
                    background: #fff;
                    border: 1px solid var(--accents-2);
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .alchemy-card:hover {
                    transition: all 0.2s ease;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                }
                
                /* MOBILE OPTIMIZATION */
                @media (max-width: 600px) {
                    /* Container */
                    .geist-container {
                        padding: 40px 20px !important;
                    }
                    
                    /* Hero */
                    input.variant-hero {
                        font-size: 3rem !important; /* Smaller title matching desktop variant-hero class but ensuring it holds */
                    }
                    
                    /* Navigation Dock (Fit to Screen) - Consistent with ProjectDetail */
                    .glass-dock {
                        width: 95% !important;
                        gap: 4px !important;
                        padding: 6px !important;
                        top: 10px !important;
                        justify-content: space-between !important;
                    }
                    .glass-dock button {
                        padding: 8px 10px !important;
                        font-size: 0.7rem !important;
                        flex: 1; 
                    }
                    
                    /* Info Row */
                    header > div:last-child {
                        flex-direction: row;
                        gap: 16px !important;
                        font-size: 0.8rem !important;
                    }
                    
                    /* Cards */
                    .geist-card {
                        padding: 16px !important; /* Reduced padding */
                    }

                    /* Input Tabs - Allow scroll on super narrow */
                    .input-tabs-container {
                         overflow-x: auto;
                         justify-content: flex-start !important; 
                         padding-bottom: 4px;
                         -webkit-overflow-scrolling: touch;
                         scrollbar-width: none; 
                    }
                    
                    /* Context Knobs - Stack vertically if too narrow */
                    .context-container {
                        flex-direction: column !important;
                        align-items: center !important;
                        gap: 32px !important;
                    }
                    .context-container > div {
                        width: 100% !important;
                    }
                    .context-divider {
                        width: 100% !important;
                        height: 1px !important;
                        margin: 0 !important;
                        background: rgba(255,255,255,0.2) !important;
                    }
                     /* Ensure buttons don't overflow */
                    .geist-btn {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        padding: 0 16px !important; 
                    }
                }
            `}</style>
        </main >
    );
}



function InputCard({ input, projectId, sessionId, knowledgeItems }: { input: KnowledgeInput, projectId: string, sessionId: string, knowledgeItems?: KnowledgeItem[] }) {
    const [isDeleting, startDelete] = useTransition();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeInputAction(projectId, sessionId, input.id);
            if (result?.error) {
                alert(`Analysis Failed: ${result.error}`);
            }
        } catch (e: any) {
            alert(`System Error: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const myItems = knowledgeItems?.filter(k => k.sourceInputId === input.id) || [];

    return (
        <div className="geist-card" style={{ marginBottom: '16px', padding: '24px', position: 'relative' }}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isConfirming) {
                        startDelete(async () => {
                            const result = await deleteSessionInputAction(projectId, sessionId, input.id);
                            if (!result.success) alert(result.error);
                        });
                    } else {
                        setIsConfirming(true);
                    }
                }}
                onMouseLeave={() => isConfirming && setIsConfirming(false)}
                disabled={isDeleting}
                style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    background: isConfirming ? '#ff0000' : 'none',
                    border: 'none',
                    borderRadius: isConfirming ? '4px' : '0',
                    cursor: 'pointer',
                    color: isConfirming ? '#fff' : 'var(--accents-3)',
                    zIndex: 10,
                    padding: isConfirming ? '4px 12px' : '8px',
                    margin: isConfirming ? '0' : '-8px',
                    fontSize: isConfirming ? '0.75rem' : '1rem',
                    transition: 'all 0.2s ease',
                    fontWeight: isConfirming ? 600 : 400
                }}
            >
                {isConfirming ? (isDeleting ? '...' : 'CONFIRM DELETE') : '✕'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: 'var(--accents-1)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {input.type}
                </span>
                {input.isAssignment && (
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fff',
                        color: '#fff',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600
                    }}>
                        ASSIGNMENT
                    </span>
                )}
                <span suppressHydrationWarning style={{ fontSize: '0.875rem', color: 'var(--accents-5)' }}>
                    {new Date(input.createdAt).toLocaleTimeString()}
                </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '8px' }}>{input.title}</h3>

            {/* Image Preview for Photos */}
            {input.rawUrl && input.type === 'image' && (
                <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--accents-2)' }}>
                    <img src={input.rawUrl} alt="Input source" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
            )}

            <div style={{
                color: 'var(--accents-5)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                maxHeight: '240px', // Limit to approx 10 lines
                overflowY: 'auto',   // Add scrollbar
                paddingRight: '4px'  // Spacing for scrollbar
            }}>
                {input.content}
            </div>

            {/* Knowledge Extraction (All Types) */}
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--accents-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accents-3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                        Analysis
                    </span>
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--accents-2)',
                            borderRadius: '4px',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            color: isAnalyzing ? 'var(--accents-4)' : 'var(--geist-foreground)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-mono)',
                            transition: 'all 0.2s',
                            opacity: isAnalyzing ? 0.7 : 1
                        }}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Extract Knowledge'}
                    </button>
                </div>
            </div>

            {/* Extracted Knowledge Items */}
            <KnowledgeList items={myItems} />

            {/* Analysis Loading Skeleton */}
            {isAnalyzing && (
                <div style={{ paddingTop: '16px', animation: 'fadeIn 0.3s ease' }}>
                    <div className="skeleton-line" style={{ width: '100%', height: '20px', marginBottom: '8px', background: 'var(--accents-2)', borderRadius: '4px' }} />
                    <div className="skeleton-line" style={{ width: '80%', height: '20px', marginBottom: '8px', background: 'var(--accents-2)', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <div className="skeleton-line" style={{ width: '60px', height: '16px', background: 'var(--accents-2)', borderRadius: '12px' }} />
                        <div className="skeleton-line" style={{ width: '80px', height: '16px', background: 'var(--accents-2)', borderRadius: '12px' }} />
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                .skeleton-line {
                    animation: pulse 1.5s infinite ease-in-out;
                }
            `}</style>

        </div>
    )
}









// function OutputSection({ project, session, isPending }: any) {
// (Simplifying for diff: replacing the entire function content logic)
// (Simplifying for diff: replacing the entire function content logic)



