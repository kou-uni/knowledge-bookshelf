'use client';

import { Project, SkillOutput } from '@/lib/types';
import Link from 'next/link';
import { createSessionAction, deleteSessionAction, updateProjectAction, updateSessionAction } from '@/app/actions';
import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InlineTextEdit } from './InlineTextEdit';
import { NavButton } from '@/components/ui';
import { ProjectStrategySection, ProjectAnalyticsSection } from '@/components/sections';
import { Archive } from '@geist-ui/icons';

export function ProjectDetailClient({ project }: { project: Project }) {
    const [isPending, startTransition] = useTransition();

    const handleCreateSession = () => {
        startTransition(async () => {
            const result = await createSessionAction(project.id);
            if (!result.success) alert(result.error);
        });
    };

    const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        e.preventDefault();
        // Native confirm kept for SessionTile for now, or can be upgraded later.
        if (confirm("Delete this session?")) {
            startTransition(async () => {
                const result = await deleteSessionAction(project.id, sessionId);
                if (!result.success) alert(result.error);
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
                        onSave={async (val) => {
                            const result = await updateProjectAction(project.id, { title: val });
                            if (!result.success) alert(result.error);
                        }}
                        className="variant-hero"
                        placeholder="Project Title"
                        containerStyle={{ width: '100%', justifyContent: 'flex-start' }}
                        style={{ fontSize: '3.5rem', fontWeight: 100, width: '100%', textAlign: 'left', letterSpacing: '-0.05em', lineHeight: '1' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <span suppressHydrationWarning style={{ color: 'var(--accents-5)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
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

                @keyframes zenPulse {
                    0% { opacity: 1; filter: brightness(1); border-color: var(--accents-2); }
                    50% { opacity: 0.7; filter: brightness(1.2); border-color: var(--accents-5); }
                    100% { opacity: 1; filter: brightness(1); border-color: var(--accents-2); }
                }

                .zen-pulse {
                    animation: zenPulse 2s infinite ease-in-out;
                    pointer-events: none;
                }

                /* MOBILE OPTIMIZATION */
                @media (max-width: 600px) {
                    /* Container padding reduce */
                    .geist-container {
                        padding: 40px 20px !important;
                    }

                    /* Hero Text */
                    input.variant-hero {
                        font-size: 2.5rem !important; /* Smaller title */
                    }
                    
                    /* Navigation Dock (Fit to Screen) */
                    .glass-dock {
                        width: 95% !important; /* Slightly narrower than full screen */
                        gap: 4px !important; /* Tight gap */
                        padding: 6px !important;
                        top: 10px !important;
                        justify-content: space-between !important;
                    }
                    .glass-dock button {
                        padding: 8px 12px !important; /* Tighter padding */
                        font-size: 0.7rem !important; /* Small text */
                        flex: 1; /* Distribute space */
                    }

                    /* Session Tile Mobile Layout */
                    .session-tile {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        padding: 20px !important;
                        gap: 16px !important;
                    }
                    .session-tile-left {
                        width: 100%;
                        display: flex;
                        align-items: center;
                        gap: 16px;
                    }
                    .session-number {
                        margin-right: 0 !important;
                        width: 40px !important; 
                        height: 40px !important;
                        font-size: 0.9rem !important;
                    }
                    .session-main-content {
                        width: 100%;
                        gap: 12px !important;
                    }
                    .session-prefix {
                        font-size: 1.5rem !important; /* Smaller header */
                    }
                    .session-meta-row {
                        flex-direction: row; /* Keep date next to inputs if possible, or stack */
                        justify-content: space-between;
                        width: 100%;
                        align-items: center;
                        margin-top: 8px;
                    }
                    
                    /* Hide/Move Delete Button */
                    .session-delete-btn {
                        position: absolute;
                        top: 16px;
                        right: 16px;
                    }
                }
            `}</style>
        </main>
    );
}

function SessionTile({ session, projectId, onDelete }: { session: any, projectId: string, onDelete: any }) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleNavigation = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on inputs/buttons
        if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
            return;
        }
        setIsNavigating(true);
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
        const result = await updateSessionAction(projectId, session.id, { title: fullTitle });
        if (!result.success) alert(result.error);
    };

    const handleDateSave = async (newVal: string) => {
        const result = await updateSessionAction(projectId, session.id, { date: newVal });
        if (!result.success) alert(result.error);
    };

    return (
        <div
            onClick={handleNavigation}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`geist-card session-tile ${isNavigating ? 'zen-pulse' : ''}`}
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
            <div className="session-main-content" style={{ display: 'flex', alignItems: 'center', flex: 1 }}>

                {/* Mobile: Row 1 (Number) */}
                <div className="session-number" style={{
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

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Prefix & Name */}
                    <div>
                        <span className="session-prefix" style={{ fontSize: '2rem', fontWeight: 100, letterSpacing: '-0.03em', color: '#fff', whiteSpace: 'nowrap', lineHeight: '1' }}>
                            {sessionPrefix}
                        </span>
                        <div style={{ marginTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                            <InlineTextEdit
                                initialValue={customTitle}
                                onSave={handleTitleSave}
                                placeholder="Session Name (Optional)"
                                style={{ fontSize: '1rem', fontWeight: 400, letterSpacing: '-0.01em', color: '#fff', width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Meta Row (Date + metrics) */}
                    <div className="session-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '8px' }}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <span style={{ fontSize: '0.7rem', color: 'var(--accents-5)', fontWeight: 600, letterSpacing: '0.05em' }}>DATE</span>
                            <InlineTextEdit
                                initialValue={session.date || ''}
                                onSave={handleDateSave}
                                placeholder="YYYY.MM.DD"
                                type="text"
                                style={{ fontSize: '0.8rem', color: 'var(--accents-5)', width: '100px' }}
                            />
                        </div>

                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--accents-5)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {session.inputs.length} IN / {session.outputs.length} OUT
                        </p>
                    </div>
                </div>
            </div>

            <div className="session-delete-btn" style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 5 }}>
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

























