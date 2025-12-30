'use client';

import Link from 'next/link';
import { Project } from '@/lib/types';
import { useState, useTransition } from 'react';
import { deleteProjectAction } from '@/app/actions';

export function ProjectBook({ project, index, hue, total }: { project: Project, index: number, hue: number, total: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const [_, startTransition] = useTransition();

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm('Delete this project?')) {
            startTransition(async () => {
                await deleteProjectAction(project.id);
            });
        }
    };

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
                        {/* vol logic: total (N), index (0..N-1) -> want 1..N order. so i+1 is correct for LTR. */}
                        <span className="vol-text">VOL.{index + 1}</span>
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
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                    cursor: 'pointer',
                    marginTop: '4px' // Gap between book and table/shelf trigger
                }}
                onClick={handleDelete}
                title="Delete Project"
            >
                <span style={{
                    color: '#666',
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    lineHeight: 1
                }}>×</span>
            </div>

            <style jsx>{`
                .book-spine {
                    width: 60px;
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
                    font-family: 'Times New Roman', serif;
                    font-size: 1.1rem;
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
                    justify-content: flex-start; /* Aligns text to top */
                    padding: 0 10px;
                    text-align: center;
                    width: 100%;
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
            `}</style>
        </div>
    );
}
