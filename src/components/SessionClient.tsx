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
import { updateSessionAction, analyzeInputAction } from '@/app/actions';
import { KnowledgeList } from './KnowledgeList';
import { KnowledgeItem } from '@/lib/types';

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
                        onSave={async (val) => await updateSessionAction(project.id, session.id, { title: val })}
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
                <AnalysisSection
                    session={session}
                    projectId={project.id}
                    isAnalyzing={isAnalyzing}
                    setIsAnalyzing={setIsAnalyzing}
                />
            </div>

            <div id="section-strategy" style={{ scrollMarginTop: '100px' }}>
                <OutputSection project={project} session={session} isPending={isPending} />
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
                        startDelete(async () => await deleteSessionInputAction(projectId, sessionId, input.id));
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
                <span style={{ fontSize: '0.875rem', color: 'var(--accents-5)' }}>
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

            <div style={{ color: 'var(--accents-5)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
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

function AnalysisSection({ session, projectId, isAnalyzing, setIsAnalyzing }: any) {
    const analysisOutput = session.outputs.find((o: SkillOutput) => o.skillId === 'analyze');

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Simulate waiting for "Loading..." (Skeleton effect)
        // In real app, this might be real network time, but here we enforce a min time for the skeleton to be seen
        // or just let the server action take its time.
        // We can just call the action. If it's fast, the skeleton flicks. 
        // Let's add a small artificial delay only if we want to ensure the user sees the 'Loading' state clearly as requested.
        await new Promise(resolve => setTimeout(resolve, 1500));
        await runSessionSkill(projectId, session.id, 'analyze');
        setIsAnalyzing(false);
    };

    return (
        <section style={{ marginTop: '80px', borderTop: '1px solid var(--accents-2)', paddingTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="variant-section">Structural Analysis</h2>
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
                            <AnalysisViewer content={analysisOutput.content} />
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
                            <p>Reflective synthesis based on the objective structures identified above. (Integration pending)</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function SkeletonScreen() {
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

function AnalysisViewer({ content }: { content: string }) {
    let data;
    try {
        data = JSON.parse(content);
    } catch {
        return <ReactMarkdown>{content}</ReactMarkdown>;
    }

    return (
        <div>
            {data.objective && (
                <>
                    {data.objective.concepts && (
                        <div style={{ marginBottom: '24px' }}>
                            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Key Concepts</strong>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {data.objective.concepts.map((c: string, i: number) => (
                                    <span key={i} style={{ background: 'var(--accents-1)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem' }}>{c}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.objective.frameworks && (
                        <div>
                            <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Frameworks</strong>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                {data.objective.frameworks.map((f: string, i: number) => (
                                    <li key={i} style={{ marginBottom: '4px' }}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
            {!data.objective && <ReactMarkdown>{content}</ReactMarkdown>}
        </div>
    )
}

function formatObjectiveContent(content: string): string {
    try {
        const data = JSON.parse(content);
        if (data.objective) {
            let output = '';
            if (data.objective.concepts && Array.isArray(data.objective.concepts)) {
                output += 'Key Concepts:\n' + data.objective.concepts.join(', ') + '\n\n';
            }
            if (data.objective.frameworks && Array.isArray(data.objective.frameworks)) {
                output += 'Frameworks:\n' + data.objective.frameworks.map((f: string) => '- ' + f).join('\n');
            }
            return output.trim() || content;
        }
        return content;
    } catch {
        return content;
    }
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            title="Copy to clipboard"
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: copied ? '#000' : 'var(--accents-3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {copied ? <Check size={16} /> : <Clipboard size={16} />}
        </button>
    )
}

function OutputSection({ project, session, isPending }: any) {
    const [strategy, setStrategy] = useState<'presentation' | 'document' | 'pack'>('presentation');
    const [activeAudience, setActiveAudience] = useState('Executive');
    const [activeStructure, setActiveStructure] = useState('Strategic');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedArtifacts, setGeneratedArtifacts] = useState<any[]>([]); // Mocking local state for demo

    const handleCrystallize = async () => {
        setIsGenerating(true);
        // Mock delay for generation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock adding an artifact
        const newArtifact = {
            id: Date.now().toString(),
            type: strategy,
            title: strategy === 'presentation' ? `${activeAudience} ${activeStructure} Deck` : strategy === 'document' ? `${activeStructure} Report` : `${activeAudience} ${activeStructure} Pack`,
            date: new Date().toLocaleTimeString()
        };
        setGeneratedArtifacts(prev => [newArtifact, ...prev]);
        setIsGenerating(false);
    };

    const handleShare = async (artifact: any) => {
        // Mock share functionality
        if (navigator.share) {
            try {
                await navigator.share({
                    title: artifact.title,
                    text: `Check out this ${artifact.type}: ${artifact.title}`,
                    url: window.location.href // Sharing current session URL for now as placeholder
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            alert(`Sharing ${artifact.title} to Google Drive... (Mock)`);
        }
    };

    return (
        <section style={{ marginTop: '80px', borderTop: '1px solid var(--accents-2)', paddingTop: '60px', paddingBottom: '120px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h2 className="variant-section" style={{ marginBottom: '8px' }}>Strategy & Crystallization</h2>
                <p style={{ color: 'var(--accents-5)' }}>Define your output strategy and crystallize knowledge into tangible assets.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>

                {/* STRATEGY & WORKBENCH */}
                <div>
                    {/* 1. STRATEGY SELECTOR */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                        <StrategyCard
                            active={strategy === 'presentation'}
                            onClick={() => setStrategy('presentation')}
                            icon={<Monitor />}
                            label="Presentation"
                        />
                        <StrategyCard
                            active={strategy === 'document'}
                            onClick={() => setStrategy('document')}
                            icon={<Layout />}
                            label="Document"
                        />
                        <StrategyCard
                            active={strategy === 'pack'}
                            onClick={() => setStrategy('pack')}
                            icon={<Package />}
                            label="NotebookLM Pack"
                        />
                    </div>

                    {/* 2. CONTEXT PARAMETERS (Always visible) */}
                    <div style={{ marginBottom: '32px' }}>
                        <div className="geist-card" style={{ padding: '24px', background: 'var(--accents-1)', border: 'none' }}>
                            <div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="variant-label" style={{ display: 'block', marginBottom: '12px' }}>Target Audience</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                                <div style={{ width: '1px', background: 'var(--accents-2)' }} />
                                <div>
                                    <label className="variant-label" style={{ display: 'block', marginBottom: '12px' }}>Structure</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {['Strategic', 'Technical', 'Educational'].map(structure => (
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

                {/* ARTIFACT GALLERY (Moved below) */}
                <div>
                    <h3 className="variant-label" style={{ marginBottom: '24px' }}>Artifacts</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {generatedArtifacts.length === 0 && (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--accents-4)', border: '1px dashed var(--accents-3)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                                <Archive size={32} />
                                <p style={{ fontSize: '0.875rem', marginTop: '12px' }}>No artifacts crystallized yet.</p>
                            </div>
                        )}
                        {generatedArtifacts.map((artifact) => (
                            <div key={artifact.id} className="geist-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', animation: 'fadeIn 0.5s ease' }}>
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
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{artifact.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--accents-4)' }}>{artifact.date} • 2.4 MB</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleShare(artifact)}
                                        title="Share to Google Drive"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accents-4)', padding: '8px' }}
                                    >
                                        <Share size={20} />
                                    </button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accents-4)', padding: '8px' }}>
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function StrategyCard({ active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? '#fff' : 'var(--accents-5)',
                border: 'none',
                borderRadius: '999px',
                padding: '8px 24px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--accents-5)';
            }}
        >
            {label}
        </button>
    )
}

function ContextKnob({ label, active, onClick }: { label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                color: active ? '#fff' : 'var(--accents-5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--accents-5)';
            }}
        >
            {label}
        </button>
    )
}

function NavButton({ label, targetId }: { label: string, targetId: string }) {
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
