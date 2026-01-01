"use client";

import { useState } from 'react';
import { Project } from '../lib/types'; // Correct relative path
import { Modal, Progress, useToasts } from '@geist-ui/core';
import { Play, FileText, Layout, Download, CheckCircle, Loader } from '@geist-ui/icons';

interface PresentationGeneratorProps {
    project: Project;
    visible: boolean;
    onClose: () => void;
    audience: string;
    structure: string;
}

export default function PresentationGenerator({ project, visible, onClose, audience, structure }: PresentationGeneratorProps) {
    const { setToast } = useToasts();
    const [step, setStep] = useState<number>(0); // 0: Idle, 1: Strategy, 2: Writing, 3: Complete
    const [templateBase64, setTemplateBase64] = useState<string | null>(null);
    const [agenda, setAgenda] = useState<any>(null);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState("Ready to crystallize");

    const startGeneration = async () => {
        if (!templateBase64) {
            setToast({ text: "No template loaded", type: "error" });
            return;
        }

        setStep(1);
        setStatusText("Step 1/3: The Strategist is designing the agenda...");
        setProgress(10);

        try {
            // STEP 1: Generate Agenda
            const res1 = await fetch('/api/generate-ppt', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'agenda',
                    projectId: project.id,
                    params: { audience, structure }
                })
            });
            const data1 = await res1.json();
            if (data1.error) throw new Error(data1.error);

            const generatedAgenda = data1.agenda;
            setAgenda(generatedAgenda);

            // Count total slides
            let totalSlides = 0;
            generatedAgenda.items.forEach((item: any) => totalSlides += item.slides.length);

            setStep(2);
            setStatusText(`Step 2/3: The Writer is drafting ${totalSlides} slides...`);

            // STEP 2: Generate Content for EACH slide (Client-Side Orchestration)
            let completedSlides = 0;
            const fullAgenda = JSON.parse(JSON.stringify(generatedAgenda)); // Deep copy

            for (const section of fullAgenda.items) {
                for (const slide of section.slides) {
                    setStatusText(`Drafting: ${slide.title}...`);

                    const res2 = await fetch('/api/generate-ppt', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'content',
                            projectId: project.id,
                            params: {
                                slideTitle: slide.title,
                                slideTopic: slide.topic,
                                context: slide.context || section.sectionTitle
                            }
                        })
                    });
                    const data2 = await res2.json();
                    if (data2.content) {
                        // Merge content back
                        slide.bullets = data2.content.bullets;
                        slide.speakerNotes = data2.content.speakerNotes;
                    }

                    completedSlides++;
                    setProgress(20 + (completedSlides / totalSlides) * 60); // Map to 20-80% range
                }
            }

            setAgenda(fullAgenda); // Update with full content

            // STEP 3: Render (Stateless: Send Base64 Template)
            setStep(3);
            setStatusText("Step 3/3: The Artisan is polishing pixels (Template Merge)...");
            setProgress(90);

            const res3 = await fetch('/api/generate-ppt', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'render',
                    projectId: project.id,
                    params: {
                        fullAgenda,
                        templateBase64 // Send the file content directly
                    }
                })
            });

            if (!res3.ok) throw new Error("Rendering failed");

            const blob = await res3.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Master_Presentation_${project.title.replace(/\s+/g, '_')}.pptx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setProgress(100);
            setStatusText("Presentation Downloaded Successfully!");
            setToast({ text: 'Alchemy Complete: Presentation Downloaded', type: 'success' });

        } catch (e: any) {
            console.error(e);
            setStatusText("Error: " + e.message);
            setToast({ text: 'Generation Failed', type: 'error' });
            setStep(0); // Reset on failure
        }
    };

    return (
        <Modal visible={visible} onClose={onClose} width="600px">
            <Modal.Title>The Alchemy Engine</Modal.Title>
            <Modal.Content>
                <div style={{ padding: '20px 0', textAlign: 'center' }}>

                    {step === 0 && (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <Layout size={64} color="var(--accents-3)" />
                            <h3 style={{ marginTop: '20px' }}>Generate Master Presentation</h3>
                            <p style={{ color: 'var(--accents-5)', marginBottom: '30px' }}>
                                This process uses a 3-stage AI pipeline to synthesize your project data into a professional PowerPoint deck.
                            </p>

                            {/* Template Upload */}
                            <div style={{ marginBottom: '20px', textAlign: 'left', background: 'var(--accents-1)', padding: '16px', borderRadius: '8px' }}>
                                <h5 style={{ margin: '0 0 8px 0' }}>Step 0: Select Template</h5>
                                <p style={{ fontSize: '0.8rem', color: 'var(--accents-5)', marginBottom: '12px' }}>
                                    Select your corporate PowerPoint template (.pptx). The file will be processed securely.
                                </p>
                                <input
                                    type="file"
                                    accept=".pptx"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            const file = e.target.files[0];
                                            const reader = new FileReader();

                                            reader.onload = (evt) => {
                                                if (evt.target?.result) {
                                                    // Store Base64 (remove Data URL prefix)
                                                    const base64 = (evt.target.result as string).split(',')[1];
                                                    setTemplateBase64(base64);
                                                    setToast({ text: "Template Ready", type: "success" });
                                                    // Auto-start for UX smoothness
                                                    // We can't call startGeneration immediately because state update is async, 
                                                    // but we can pass the base64 logically if we refactored.
                                                    // For now, let's show a button or just delay start.
                                                    // Actually, let's just show a START button now that we have the file.
                                                }
                                            };

                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                {templateBase64 && (
                                    <button
                                        onClick={() => startGeneration()}
                                        className="geist-btn"
                                        style={{ marginTop: '16px', width: '100%', background: '#fff', color: '#000', border: 'none' }}
                                    >
                                        Start Generation
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {step > 0 && (
                        <div style={{ animation: 'fadeIn 0.5s' }}>
                            <div style={{ marginBottom: '24px' }}>
                                {step === 1 && <FileText className="spin-slow" size={48} color="#0070f3" />}
                                {step === 2 && <Layout className="pulse" size={48} color="#7928ca" />}
                                {step === 3 && <Download className="bounce" size={48} color="#10b981" />}
                                {progress === 100 && <CheckCircle size={48} color="#10b981" />}
                            </div>

                            <h4 style={{ marginBottom: '10px' }}>{statusText}</h4>
                            <Progress value={progress} type={progress === 100 ? "success" : "default"} />

                            <div style={{ marginTop: '30px', textAlign: 'left', background: 'var(--accents-1)', padding: '16px', borderRadius: '8px', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: step >= 1 ? '#000' : 'var(--accents-3)' }}>
                                    {step > 1 ? <CheckCircle size={16} /> : (step === 1 ? <Loader size={16} /> : <div style={{ width: 16 }} />)}
                                    Stage 1: Strategist (Agenda Design)
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: step >= 2 ? '#000' : 'var(--accents-3)' }}>
                                    {step > 2 ? <CheckCircle size={16} /> : (step === 2 ? <Loader size={16} /> : <div style={{ width: 16 }} />)}
                                    Stage 2: Writer (Content Generation)
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: step >= 3 ? '#000' : 'var(--accents-3)' }}>
                                    {progress === 100 ? <CheckCircle size={16} /> : (step === 3 ? <Loader size={16} /> : <div style={{ width: 16 }} />)}
                                    Stage 3: Artisan (PPTX Rendering)
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </Modal.Content>
            <style jsx global>{`
                .spin-slow { animation: spin 3s linear infinite; }
                .pulse { animation: pulse 2s infinite; }
                .bounce { animation: bounce 1s infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            `}</style>
        </Modal>
    );
}
