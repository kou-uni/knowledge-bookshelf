'use client';

import { Project } from '@/lib/types';
import Link from 'next/link';
import { createSessionAction, deleteSessionAction, updateSessionDateAction } from '@/app/actions';
import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';

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

        if (confirm("Delete this session?")) {
            startTransition(async () => {
                await deleteSessionAction(project.id, sessionId);
            });
        }
    };

    return (
        <main className="geist-container" style={{ padding: '80px 0' }}>
            <header style={{ marginBottom: '60px' }}>
                <Link href="/" style={{
                    color: 'var(--accents-5)',
                    fontSize: '0.875rem',
                    marginBottom: '24px',
                    display: 'inline-block',
                    letterSpacing: '0.05em',
                    textDecoration: 'none'
                }}>
                    ← DASHBOARD
                </Link>
                <h1 style={{ marginBottom: '16px', fontWeight: 100 }}>{project.title}</h1>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--accents-5)', fontWeight: 200, fontSize: '0.9rem' }}>
                        STARTED {new Date(project.createdAt).toLocaleDateString().toUpperCase()}
                    </span>
                </div>
            </header>

            <section>
                <div style={{
                    marginBottom: '40px',
                    borderBottom: '1px solid var(--accents-2)',
                    paddingBottom: '20px'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 200 }}>Curriculum Timeline</h2>
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

                    {/* Add Session Tile */}
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
                            opacity: 0.6,
                            cursor: 'pointer',
                            background: 'transparent',
                            width: '100%',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem', fontWeight: 200, color: 'var(--accents-5)' }}>
                            {isPending ? 'CREATING...' : '+ NEW SESSION'}
                        </span>
                    </button>

                </div>
            </section>
        </main>
    );
}

function SessionTile({ session, projectId, onDelete }: { session: any, projectId: string, onDelete: any }) {
    const router = useRouter();
    const [date, setDate] = useState(session.date || '');
    const [isHovered, setIsHovered] = useState(false);

    const handleNavigation = () => {
        router.push(`/projects/${projectId}/sessions/${session.id}`);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };

    const handleDateBlur = async () => {
        if (date !== session.date) {
            await updateSessionDateAction(projectId, session.id, date);
        }
    }

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
                borderColor: isHovered ? '#666' : 'var(--accents-2)',
                backgroundColor: isHovered ? '#1a1a1a' : 'transparent' // Subtle highlight
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '50%',
                    border: '1px solid var(--accents-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 200, fontSize: '1.5rem',
                    marginRight: '32px',
                    color: 'var(--accents-5)'
                }}>
                    {session.sessionNumber}
                </div>

                <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 300 }}>{session.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accents-5)', fontWeight: 300 }}>
                            {session.inputs.length} INPUTS • {session.outputs.length} OUTPUTS
                        </p>

                        {/* DATE INPUT */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px', paddingLeft: '16px', borderLeft: '1px solid #333' }}
                        >
                            <span style={{ fontSize: '0.8rem', color: '#555' }}>DATE</span>
                            <input
                                type="text"
                                value={date}
                                onChange={handleDateChange}
                                onBlur={handleDateBlur}
                                placeholder="YYYY.MM.DD"
                                className="geist-input"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid #333',
                                    color: '#888',
                                    fontSize: '0.9rem',
                                    width: '120px',
                                    padding: '4px 0',
                                    height: 'auto'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 5 }}>
                <button
                    onClick={(e) => onDelete(e, session.id)}
                    className="geist-btn secondary"
                    style={{ height: '40px', color: 'var(--geist-error)', borderColor: 'var(--accents-2)' }}
                    title="Delete Session"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
