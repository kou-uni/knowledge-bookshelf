'use client';

import Link from 'next/link';
import { Project } from '@/lib/types';
import { useState, useTransition } from 'react';
import { deleteProjectAction } from '@/app/actions';

export function ProjectBook({ project, index, hue, total }: { project: Project, index: number, hue: number, total: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const [_, startTransition] = useTransition();

    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleConfirm = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(false);
        setIsDeleting(true);

        // Play vanish animation before actual deletion
        setTimeout(() => {
            startTransition(async () => {
                await deleteProjectAction(project.id);
            });
        }, 600);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(false);
    };

    return (
        <div
            className={isDeleting ? 'book-vanishing' : 'book-appearing'}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: isHovered || showConfirm ? 100 : 1 // Lift active book above others
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link
                href={`/projects/${project.id}`}
                style={{ textDecoration: 'none' }}
            >
                <div
                    className="book-spine"
                    style={{
                        height: '350px',
                        background: `linear-gradient(90deg, 
                            hsl(${hue}, 40%, 15%) 0%, 
                            hsl(${hue}, 30%, 25%) 20%, 
                            hsl(${hue}, 40%, 10%) 80%
                        )`
                    }}
                >
                    <div className="spine-header"></div>
                    <div className="spine-title">{project.title}</div>
                    <div className="spine-footer">
                        {/* vol logic: total - index (Newest is last Vol, Oldest is Vol.1) */}
                        <span className="vol-text">VOL.{total - index}</span>
                    </div>
                </div>
            </Link>

            {/* Subtle Delete Zone Below Book */}
            <div
                style={{
                    height: '24px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isHovered || showConfirm ? 1 : 0,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer',
                    marginTop: '4px',
                    position: 'relative'
                }}
                onClick={handleDeleteClick}
                title="Delete Project"
            >
                <span style={{
                    color: '#666',
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    lineHeight: 1
                }}>×</span>

                {/* MEDIEVAL CONFIRMATION BUBBLE */}
                {showConfirm && (
                    <div className="medieval-bubble" onClick={(e) => e.stopPropagation()}>
                        <div className="bubble-content">
                            <p style={{ margin: '0 0 12px 0', fontFamily: 'serif', fontSize: '0.9rem', color: '#3e2723' }}>
                                此の書を虚無へと<br />還すが良いか？
                            </p>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button onClick={handleConfirm} className="medieval-btn danger">然り</button>
                                <button onClick={handleCancel} className="medieval-btn">否</button>
                            </div>
                        </div>
                        <div className="bubble-arrow"></div>
                    </div>
                )}
            </div>

            <style jsx>{`
                /* MAGIC ANIMATIONS */
                @keyframes bookAppear {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.9);
                        filter: brightness(0);
                    }
                    50% {
                        opacity: 1;
                        filter: brightness(1.5); /* Magical flash */
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        filter: brightness(1);
                    }
                }

                @keyframes bookVanish {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                        filter: brightness(1);
                    }
                    30% {
                        transform: scale(1.1);
                        filter: brightness(2) blur(2px); /* Flash before disappearing */
                    }
                    100% {
                        transform: scale(0) translateY(-20px);
                        opacity: 0;
                        filter: brightness(0) blur(10px);
                    }
                }

                .book-appearing {
                    animation: bookAppear 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                .book-vanishing {
                    animation: bookVanish 0.6s ease-in forwards;
                    pointer-events: none; /* Prevent clicks during exit */
                }

                .book-spine {
                    width: 80px; /* Wider spine */
                    border-radius: 2px;
                    box-shadow: 
                        inset 4px 0 6px rgba(0,0,0,0.5),
                        inset -2px 0 4px rgba(255,255,255,0.05),
                        5px 5px 15px rgba(0,0,0,0.6);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    position: relative;
                    /* Make relative for absolute children positioning */
                }
                .book-spine:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 
                        inset 4px 0 6px rgba(0,0,0,0.5),
                        5px 15px 25px rgba(0,0,0,0.7);
                    z-index: 10;
                }
                
                /* Layout within Spine */
                .spine-header {
                    position: absolute;
                    top: 20px;
                    left: 0;
                    right: 0;
                    height: 20px;
                    border-top: 2px solid rgba(198, 169, 105, 0.4);
                    border-bottom: 2px solid rgba(198, 169, 105, 0.4);
                }

                /* Vertical Text Mode for Title */
                .spine-title {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    color: rgba(255,255,255,0.9);
                    font-family: 'Garamond', 'Didot', 'Times New Roman', serif; /* Ancient style */
                    font-size: 0.95rem; /* Smaller font */
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    /* Centering Logic */
                    position: absolute;
                    top: 60px;
                    bottom: 60px;
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center; /* Changed from flex-start to center for better aesthetics */
                    padding: 0 10px;
                    text-align: center;
                    width: 100%;
                    overflow: hidden; /* Ensure no spill */
                }

                .spine-footer {
                    position: absolute;
                    bottom: 20px;
                    left: 0;
                    right: 0;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .vol-text {
                    font-family: monospace;
                    font-size: 0.8rem;
                    color: rgba(198, 169, 105, 0.7);
                    letter-spacing: 0.05em;
                }

                /* MEDIEVAL POPUP STYLES */
                @keyframes popIn {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) scale(0.5) translateY(10px);
                    }
                    70% {
                        transform: translateX(-50%) scale(1.1) translateY(-5px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(-50%) scale(1) translateY(0);
                    }
                }

                .medieval-bubble {
                    position: absolute;
                    bottom: 30px; /* Above the X */
                    left: 50%;
                    transform: translateX(-50%);
                    width: 160px;
                    background: #f4e4bc; /* Parchment */
                    border: 2px solid #5d4037;
                    border-radius: 4px;
                    padding: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    z-index: 100;
                    text-align: center;
                    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    transform-origin: bottom center;
                }

                .medieval-bubble::before {
                    content: '';
                    position: absolute;
                    top: 2px; left: 2px; right: 2px; bottom: 2px;
                    border: 1px dashed #5d4037;
                    pointer-events: none;
                }

                .bubble-arrow {
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%) rotate(45deg);
                    width: 10px;
                    height: 10px;
                    background: #f4e4bc;
                    border-right: 2px solid #5d4037;
                    border-bottom: 2px solid #5d4037;
                }

                .medieval-btn {
                    background: transparent;
                    border: 1px solid #5d4037;
                    color: #3e2723;
                    font-family: serif;
                    font-size: 0.8rem;
                    cursor: pointer;
                    padding: 2px 8px;
                    transition: all 0.2s;
                }

                .medieval-btn:hover {
                    background: #5d4037;
                    color: #fff;
                }

                .medieval-btn.danger:hover {
                    background: #8b0000;
                    border-color: #8b0000;
                    color: #fff;
                }
            `}</style>
        </div>
    );
}
