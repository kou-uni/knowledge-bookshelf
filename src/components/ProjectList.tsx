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
            <div className="hero-container">
                <div className="hero-overlay"></div>

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 20px', marginTop: '40px' }}>
                    {/* Icon Removed as per User Request */}

                    <h1 className="hero-title">
                        Bookshelf
                    </h1>
                    <p className="hero-subtitle">
                        Crystallize Your Experience into Wisdom
                    </p>
                </div>
            </div>

            {/* BOOKSHELF / COLLECTION */}
            <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 350px)', position: 'relative', paddingBottom: '60px' }}>

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

                {/* FOOTER */}
                <div style={{
                    marginTop: '40px',
                    borderTop: '1px solid #333',
                    paddingTop: '20px',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-geist-mono)',
                    letterSpacing: '0.1em'
                }}>
                    powered by uni**
                </div>
            </div>

            <style jsx>{`
        .bookshelf {
            margin-top: 20px;
        }

        /* HERO STYLES */
        .hero-container {
            position: relative;
            height: 500px;
            width: 100vw;
            margin-left: calc(50% - 50vw);
            margin-top: -80px;
            margin-bottom: 20px;
            background-image: url(/library-bg.png);
            background-size: cover;
            background-position: center;
            background-color: #111;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: height 0.3s ease;
        }
        .hero-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(3px);
        }
        .hero-title {
            font-size: 6rem;
            font-weight: 100;
            color: #fff;
            text-shadow: 0 10px 30px rgba(0,0,0,0.8);
            margin-bottom: 10px;
            letter-spacing: -0.06em;
            line-height: 1;
        }
        .hero-subtitle {
            font-size: 1.4rem;
            font-weight: 200;
            color: rgba(255,255,255,0.9);
            max-width: 700px;
            margin: 0 auto;
            text-shadow: 0 2px 10px rgba(0,0,0,1);
            letter-spacing: 0.05em;
        }

        /* IPHONE 16 / MOBILE OPTIMIZATION */
        @media (max-width: 600px) {
            .hero-container {
                height: 200px; /* Reduced to user preference */
            }
            .hero-title {
                font-size: clamp(2.5rem, 10vw, 3rem); /* Fluid scaling for narrow <360px */
            }
            .hero-subtitle {
                font-size: clamp(0.8rem, 3vw, 0.9rem);
                max-width: 90%;
            }
            .shelf-row {
                padding: 0 max(20px, 12vw); /* Elastic padding: never less than 20px, scales with width */
                gap: clamp(16px, 4vw, 24px); /* Fluid gap */
                scroll-snap-type: x mandatory; 
                justify-content: flex-start; 
            }
            .shelf-row > :global(*) {
                scroll-snap-align: center;
            }
        }
        
        .shelf-row {
            display: flex;
            align-items: flex-start; 
            justify-content: center; 
            gap: 12px;
            padding: 0 40px;
            height: 350px; 
            overflow-x: auto;
            scrollbar-width: none; 
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
            width: 72px; 
            border-radius: 3px 6px 6px 3px;
            background: #1a1a1a; 
            color: #d4cdc5; 
            box-shadow: 
                inset 2px 0 5px rgba(0,0,0,0.8), 
                inset -1px 0 2px rgba(255,255,255,0.1), 
                -5px 0 10px rgba(0,0,0,0.5); 
            display: block; 
            text-decoration: none;
            transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: pointer;
            position: relative; 
            border-left: 4px solid rgba(0,0,0,0.2); 
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
            align-items: center; 
            justify-content: flex-start; 
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
