'use client';

import { Project, SkillOutput } from '@/lib/types';
import Link from 'next/link';
import { createSessionAction, deleteSessionAction, updateProjectAction, updateSessionAction, runProjectSkill } from '@/app/actions';
import { useTransition, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InlineTextEdit } from './InlineTextEdit';
import { BarChart2, PieChart, Activity, Package, Layout, Monitor, Share, Download, Archive, Check, Clipboard } from '@geist-ui/icons';
import ReactMarkdown from 'react-markdown';

export function ProjectDetailClient({ project }: { project: Project }) {
    const [isPending, startTransition] = useTransition();

    const handleCreateSession = () => {
        startTransition(async () => {
            await createSessionAction(project.id);
        });
    };

    const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        e.preventDefault();
        // Native confirm kept for SessionTile for now, or can be upgraded later.
        if (confirm("Delete this session?")) {
            startTransition(async () => {
                await deleteSessionAction(project.id, sessionId);
            });
        }
    };

    return (
        <main className="geist-container" style={{ padding: '80px 0', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '60px', textAlign: 'left' }}>
                <Link href="/" style={{
                    color: 'var(--accents-5)',
                    fontSize: '0.75rem',
                    marginBottom: '32px',
                    display: 'inline-block',
                    letterSpacing: '0.1em',
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    fontWeight: 600
                }}>
                    ← Dashboard
                </Link>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
                    <InlineTextEdit
                        initialValue={project.title}
                        onSave={async (val) => { await updateProjectAction(project.id, { title: val }) }}
                        className="variant-hero"
                        placeholder="Project Title"
                        containerStyle={{ width: '100%', justifyContent: 'flex-start' }}
                        style={{ fontSize: '3.5rem', fontWeight: 100, width: '100%', textAlign: 'left', letterSpacing: '-0.05em', lineHeight: '1' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <span style={{ color: 'var(--accents-5)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        STARTED {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ color: 'var(--accents-5)', opacity: 0.5 }}>|</span>
                    <span style={{ color: 'var(--accents-5)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {project.sessions.length} SESSIONS
                    </span>
                </div>
            </header>

            {/* Navigation Dock */}
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
                <NavButton label="CURRICULUM" targetId="section-curriculum" />
                <NavButton label="ANALYTICS" targetId="section-analytics" />
                <NavButton label="STRATEGY" targetId="section-strategy" />
            </nav>

            <div id="section-curriculum" style={{ scrollMarginTop: '100px', marginBottom: '100px' }}>
                <div style={{
                    marginBottom: '40px',
                    borderBottom: '1px solid var(--accents-2)',
                    paddingBottom: '20px'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '0' }}>Curriculum Timeline</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {project.sessions.map((session) => (
                        <SessionTile
                            key={session.id}
                            session={session}
                            projectId={project.id}
                            onDelete={handleDeleteSession}
                        />
                    ))}

                    <button
                        onClick={handleCreateSession}
                        disabled={isPending}
                        className="geist-card"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            borderStyle: 'dashed',
                            borderWidth: '1px',
                            borderColor: 'var(--accents-2)',
                            opacity: 0.6,
                            cursor: 'pointer',
                            background: 'transparent',
                            width: '100%',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--accents-5)', textTransform: 'uppercase' }}>
                            {isPending ? 'CREATING...' : '+ NEW SESSION'}
                        </span>
                    </button>
                </div>
            </div>

            <div id="section-analytics" style={{ scrollMarginTop: '100px', marginBottom: '100px' }}>
                <ProjectAnalyticsSection project={project} />
            </div>

            <div id="section-strategy" style={{ scrollMarginTop: '100px', marginBottom: '100px' }}>
                <ProjectStrategySection project={project} />
            </div>

            <style jsx global>{`
                .glass-dock {
                    backdrop-filter: blur(20px);
                    background: rgba(255,255,255,0.7);
                    border: 1px solid var(--accents-2);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1);
                }
            `}</style>
        </main>
    );
}

function SessionTile({ session, projectId, onDelete }: { session: any, projectId: string, onDelete: any }) {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    const handleNavigation = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on inputs/buttons
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
            return;
        }
        router.push(`/projects/${projectId}/sessions/${session.id}`);
    };

    const sessionPrefix = `Session ${session.sessionNumber}`;
    // Extract custom title part: remove prefix and trimming spaces/colons if any
    let customTitle = session.title;
    if (session.title.startsWith(sessionPrefix)) {
        customTitle = session.title.substring(sessionPrefix.length).replace(/^[:\s]+/, '');
    }

    const handleTitleSave = async (newVal: string) => {
        const fullTitle = newVal ? `${sessionPrefix}: ${newVal}` : sessionPrefix;
        await updateSessionAction(projectId, session.id, { title: fullTitle });
    };

    const handleDateSave = async (newVal: string) => {
        await updateSessionAction(projectId, session.id, { date: newVal });
    };

    return (
        <div
            onClick={handleNavigation}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="geist-card"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isHovered ? 'var(--accents-4)' : 'var(--accents-2)',
                backgroundColor: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                    width: '48px', height: '48px',
                    borderRadius: '50%',
                    border: '1px solid var(--accents-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 400, fontSize: '1rem',
                    marginRight: '24px',
                    color: 'var(--accents-5)',
                    flexShrink: 0
                }}>
                    {session.sessionNumber}
                </div>

                <div style={{ flex: 1, display: 'flex', gap: '32px', alignItems: 'center' }}>
                    {/* LEFT COL: Session Number Prefix */}
                    <div>
                        <span style={{ fontSize: '2rem', fontWeight: 100, letterSpacing: '-0.03em', color: '#fff', whiteSpace: 'nowrap', lineHeight: '1' }}>
                            {sessionPrefix}
                        </span>
                    </div>

                    {/* MIDDLE COL: content (Name + Date) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {/* Custom Name */}
                        <div style={{ marginBottom: '8px' }} onClick={(e) => e.stopPropagation()}>
                            <InlineTextEdit
                                initialValue={customTitle}
                                onSave={handleTitleSave}
                                placeholder="Session Name (Optional)"
                                style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '-0.01em', color: '#fff', width: '100%' }}
                            />
                        </div>

                        {/* Date Input */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                        >
                            <span style={{ fontSize: '0.75rem', color: 'var(--accents-5)', fontWeight: 600, letterSpacing: '0.05em' }}>DATE</span>
                            <InlineTextEdit
                                initialValue={session.date || ''}
                                onSave={handleDateSave}
                                placeholder="YYYY.MM.DD"
                                type="text"
                                style={{ fontSize: '0.875rem', color: 'var(--accents-5)', width: '120px', textAlign: 'center' }}
                            />
                        </div>
                    </div>

                    {/* RIGHT COL: Meta */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--accents-5)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right' }}>
                            {session.inputs.length} INPUTS<br />
                            {session.outputs.length} OUTPUTS
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 5 }}>
                <button
                    onClick={(e) => onDelete(e, session.id)}
                    className="geist-btn secondary"
                    style={{
                        height: '32px', width: '32px',
                        padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--geist-error)',
                        borderColor: 'transparent',
                        borderRadius: '50%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    title="Delete Session"
                >
                    ×
                </button>
            </div>
        </div>
    );
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

function CountUp({ end }: { end: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const duration = 1500; // 1.5s as per guidline
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // EaseOutQuad
            const ease = 1 - (1 - percentage) * (1 - percentage);

            setCount(Math.floor(ease * end));

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end]);

    return <>{count}</>;
}

function ProjectAnalyticsSection({ project }: { project: Project }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const totalInputs = project.sessions.reduce((acc, s) => acc + s.inputs.length, 0);
    const totalOutputs = project.sessions.reduce((acc, s) => acc + s.outputs.length, 0);
    const totalWords = totalInputs * 450;

    // Find project-level analysis output (skillId 'analyze')
    // Project outputs are stored in `project.outputs`
    const analysisOutput = project.outputs?.find((o: SkillOutput) => o.skillId === 'analyze');

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        // Skeleton Law: visible flicker
        await new Promise(resolve => setTimeout(resolve, 1500));
        await runProjectSkill(project.id, 'analyze');
        setIsAnalyzing(false);
    };

    return (
        <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '40px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '20px' }}>Project Analytics</h2>

            {/* Numeric Vitality */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '80px' }}>
                <div className="geist-card" style={{ padding: '32px', border: '1px solid var(--accents-2)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--accents-5)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Total Inputs</div>
                    <div style={{ fontSize: '3rem', fontWeight: 100 }}>
                        <CountUp end={totalInputs} />
                    </div>
                </div>
                <div className="geist-card" style={{ padding: '32px', border: '1px solid var(--accents-2)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--accents-5)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Total Words (Est)</div>
                    <div style={{ fontSize: '3rem', fontWeight: 100 }}>
                        <CountUp end={totalWords} />
                    </div>
                </div>
                <div className="geist-card" style={{ padding: '32px', border: '1px solid var(--accents-2)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--accents-5)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Crystallization Ratio</div>
                    <div style={{ fontSize: '3rem', fontWeight: 100 }}>
                        <CountUp end={Math.floor((totalOutputs / (totalInputs || 1)) * 100)} />%
                    </div>
                </div>
            </div>

            {/* Structural Analysis */}
            <section style={{ borderTop: '1px solid var(--accents-2)', paddingTop: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 className="variant-section" style={{ fontSize: '1.5rem', fontWeight: 200 }}>Structural Analysis</h2>
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
                                <p>Reflective synthesis based on the objective structures identified above. (Integration pending)</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

function ProjectStrategySection({ project }: { project: Project }) {
    const [strategy, setStrategy] = useState<'presentation' | 'document' | 'pack'>('presentation');
    const [activeAudience, setActiveAudience] = useState('Executive');
    const [activeStructure, setActiveStructure] = useState('Strategic');
    const [isGenerating, setIsGenerating] = useState(false);

    // Use project.outputs for artifacts list (filtering likely needed in real app, but using outputs for now)
    const [artifacts, setArtifacts] = useState<any[]>(project.outputs || []); // In real app, re-fetch or use props

    const handleGenerate = async () => {
        setIsGenerating(true);
        await new Promise(r => setTimeout(r, 2000)); // Mock latency
        const newItem = {
            id: Date.now().toString(),
            type: strategy,
            title: `Project ${strategy === 'pack' ? 'Source Pack' : 'Master Doc'} (${activeAudience})`,
            date: new Date().toLocaleDateString()
        };
        setArtifacts([newItem, ...artifacts]);
        setIsGenerating(false);
    };

    return (
        <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '40px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '20px' }}>Strategy & Crystallization</h2>
            <p style={{ color: 'var(--accents-5)', marginBottom: '32px' }}>Synthesize the entire project curriculum into a final deliverable.</p>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <StrategyCard active={strategy === 'presentation'} onClick={() => setStrategy('presentation')} label="Master Presentation" icon={<Monitor />} />
                <StrategyCard active={strategy === 'document'} onClick={() => setStrategy('document')} label="Full Report" icon={<Layout />} />
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

            <div style={{ marginBottom: '40px' }}>
                <button
                    onClick={handleGenerate}
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
                {artifacts.map((a: any) => (
                    <div key={a.id} className="geist-card" style={{ padding: '24px', border: '1px solid var(--accents-2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                            <Package size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 500 }}>{a.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accents-5)' }}>{a.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StrategyCard({ active, onClick, label, icon }: any) {
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
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--accents-5)';
            }}
        >
            {icon && <span>{icon}</span>}
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

function SkeletonScreen() {
    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div className="geist-card" style={{ padding: '40px', height: '300px', background: '#111', animation: 'pulse 2s infinite ease-in-out', border: '1px solid var(--accents-2)', borderRadius: '8px' }}>
                <div style={{ width: '30%', height: '20px', background: 'var(--accents-2)', marginBottom: '30px', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '16px', background: 'var(--accents-2)', marginBottom: '12px', borderRadius: '4px' }} />
                <div style={{ width: '90%', height: '16px', background: 'var(--accents-2)', marginBottom: '12px', borderRadius: '4px' }} />
                <div style={{ width: '95%', height: '16px', background: 'var(--accents-2)', marginBottom: '12px', borderRadius: '4px' }} />
            </div>
            <div className="geist-card" style={{ padding: '40px', height: '200px', background: '#111', animation: 'pulse 2s infinite ease-in-out', animationDelay: '0.2s', border: '1px solid var(--accents-2)', borderRadius: '8px' }}>
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
