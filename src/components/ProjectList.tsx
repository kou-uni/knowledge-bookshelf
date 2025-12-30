'use client';

import { Project } from '@/lib/types';
import Link from 'next/link';
import { ProjectBook } from './ProjectBook';

interface ProjectListProps {
    projects: Project[];
}
import { createNewProject } from '@/app/actions';
import { useState } from 'react';

export function ProjectList({ projects }: { projects: Project[] }) {
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="font-geist">
            {/* HERO SECTION: Library Background */}
            <div style={{
                position: 'relative',
                height: '500px',
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                marginTop: '-80px',
                marginBottom: '20px',
                backgroundImage: 'url(/library-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#111', // Fallback
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(3px)'
                }}></div>

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', marginTop: '40px' }}>
                    {/* Icon: Antique Book (Simple) */}
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto 24px auto', opacity: 0.9, color: '#d4cdc5' }}>
                        <path d="M5 4C5 2.89543 5.89543 2 7 2H19C19.5523 2 20 2.44772 20 3V19C20 19.5523 19.5523 20 19 20H7C5.89543 20 5 19.1046 5 18V4Z" stroke="currentColor" strokeWidth="1" />
                        <path d="M5 4H7V20H5V4Z" fill="currentColor" fillOpacity="0.2" />
                        <line x1="5" y1="7" x2="7" y2="7" stroke="currentColor" strokeWidth="1" />
                        <line x1="5" y1="11" x2="7" y2="11" stroke="currentColor" strokeWidth="1" />
                        <line x1="5" y1="15" x2="7" y2="15" stroke="currentColor" strokeWidth="1" />
                        <line x1="16" y1="2" x2="16" y2="20" stroke="currentColor" strokeWidth="0.5" />
                    </svg>

                    <h1 style={{
                        fontSize: '6rem',
                        fontWeight: 100,
                        color: '#fff',
                        textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                        marginBottom: '10px',
                        letterSpacing: '-0.06em',
                        lineHeight: 1
                    }}>
                        Bookshelf
                    </h1>
                    <p style={{
                        fontSize: '1.4rem',
                        fontWeight: 200,
                        color: 'rgba(255,255,255,0.9)',
                        maxWidth: '700px',
                        margin: '0 auto',
                        textShadow: '0 2px 10px rgba(0,0,0,1)',
                        letterSpacing: '0.05em'
                    }}>
                        A Knowledge Factory for Corporate Intelligence
                    </p>
                </div>
            </div>

            {/* BOOKSHELF / COLLECTION */}
            <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Helper text & Action */}
                <div style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 100, color: '#ededed', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
                        Collection
                    </h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="geist-btn"
                        style={{ height: '50px', fontSize: '1rem', border: '1px solid #555', background: '#222', padding: '0 30px' }}
                    >
                        + NEW BOOK
                    </button>
                </div>

                {/* Create Project Modal */}
                {isCreating && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', zIndex: 999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div className="geist-card" style={{ width: '500px', background: '#111', border: '1px solid #333', padding: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', fontWeight: 200 }}>Create New Project</h3>
                            <form action={async (formData) => {
                                await createNewProject(formData);
                                setIsCreating(false);
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: '#888' }}>TITLE</label>
                                    <input name="title" className="geist-input" placeholder="e.g. Strategic Management" required autoFocus />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: '#888' }}>CATEGORY</label>
                                    <select name="type" className="geist-input">
                                        <option value="management">Management</option>
                                        <option value="finance">Finance</option>
                                        <option value="classic">Liberal Arts</option>
                                        <option value="tech">Technology</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                                    <button type="button" onClick={() => setIsCreating(false)} className="geist-btn secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="geist-btn" style={{ flex: 1 }}>Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* SHELVES */}
                <div className="bookshelf">
                    {/* Top Shelf */}
                    <div className="shelf-row">
                        {projects.map((project, i) => {
                            // Generate pseudo-random aesthetic based on ID
                            const hue = (parseInt(project.id, 36) % 40) + 10; // Dark browns/reds (10-50 hue)
                            return (
                                <ProjectBook
                                    key={project.id}
                                    project={project}
                                    index={i}
                                    hue={hue}
                                    total={projects.length}
                                />
                            )
                        })}

                        {projects.length === 0 && (
                            <div style={{ color: '#555', padding: '40px', fontWeight: 200 }}>
                                The shelf is empty. Add a new book to start.
                            </div>
                        )}
                    </div>

                    {/* Shelf Board */}
                    <div className="shelf-board"></div>
                </div>
            </div>

            <style jsx>{`
        .bookshelf {
            margin-top: 20px;
        }
        
        .shelf-row {
            display: flex;
            align-items: flex-start; /* Fix "Staircase" bug by anchoring to top */
            justify-content: center; /* Center books */
            gap: 12px;
            padding: 0 40px;
            height: 350px; /* Fixed height instead of min-height */
            overflow-x: auto;
            scrollbar-width: none; /* Hide scrollbar */
        }

        .shelf-board {
            height: 25px;
            background: #2b1d18;
            width: 100%;
            border-radius: 2px;
            box-shadow: 0 15px 30px rgba(0,0,0,0.6);
            margin-bottom: 60px;
            background-image: linear-gradient(to bottom, #3e2723, #2b1d18);
            border-top: 1px solid rgba(255,255,255,0.1);
        }

        .book-spine {
            width: 72px; /* Slight width increase */
            border-radius: 3px 6px 6px 3px;
            background: #1a1a1a; /* Fallback */
            color: #d4cdc5; /* Antique Paper Text Color */
            box-shadow: 
                inset 2px 0 5px rgba(0,0,0,0.8), /* Spine shadow */
                inset -1px 0 2px rgba(255,255,255,0.1), /* Highlight */
                -5px 0 10px rgba(0,0,0,0.5); /* Drop shadow */
            display: block; /* Use Block for Absolute children */
            text-decoration: none;
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: pointer;
            position: relative; /* Anchor for absolute children */
            border-left: 4px solid rgba(0,0,0,0.2); /* Deep spine ridge */
            overflow: hidden;
        }

        .book-spine:hover {
            transform: translateY(-20px) scale(1.02);
            z-index: 10;
            box-shadow: -15px 10px 30px rgba(0,0,0,0.7);
        }

        /* Bands on spine */
        .spine-header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background-image: 
                linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.5) 45%, rgba(255,255,255,0.1) 46%, transparent 50%),
                linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.5) 85%, rgba(255,255,255,0.1) 86%, transparent 90%);
        }

        .spine-title {
            position: absolute;
            top: 40px;
            bottom: 40px;
            left: 0;
            width: 100%;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: 1.15rem;
            letter-spacing: 0.15em;
            font-weight: 300;
            overflow: hidden;
            text-overflow: ellipsis;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            padding: 10px 0;
            display: flex;
            align-items: center; /* Horizontally center */
            justify-content: flex-start; /* Vertically align to top */
        }

        .spine-footer {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: linear-gradient(to bottom, transparent 10%, rgba(0,0,0,0.5) 15%, rgba(0,0,0,0.5) 25%, rgba(255,255,255,0.1) 26%, transparent 30%);
        }

        .vol-text {
            font-size: 0.7rem; 
            opacity: 0.7; 
            font-family: var(--font-geist-mono);
            margin-top: 0;
        }
      `}</style>
        </div>
    );
}
