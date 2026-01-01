'use client';

import { useState, useRef, useEffect } from 'react';
import { addSessionInput, refineTextAction } from '@/app/actions';
import { Check } from '@geist-ui/icons';

type InputMode = 'text' | 'voice' | 'upload' | 'photo';

export function InputManager({ projectId, sessionId, onCancel }: { projectId: string; sessionId: string; onCancel: () => void }) {
    const [mode, setMode] = useState<InputMode>('text');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    // Common State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAssignment, setIsAssignment] = useState(false);

    const recognitionRef = useRef<any>(null);

    const handleVoiceToggle = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            if ('webkitSpeechRecognition' in window) {
                const SpeechRecognition = (window as any).webkitSpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    let interim_transcript = '';
                    let final_transcript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final_transcript += event.results[i][0].transcript;
                        } else {
                            interim_transcript += event.results[i][0].transcript;
                        }
                    }

                    if (final_transcript) {
                        setVoiceTranscript(prev => prev + ' ' + final_transcript);
                        setContent(prev => prev + ' ' + final_transcript);
                    }
                    setInterimTranscript(interim_transcript);
                };

                recognitionRef.current.start();
                setIsRecording(true);
            } else {
                alert('Voice recognition not supported in this browser.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);

        let finalContent = content;
        if (mode === 'photo' && previewUrl) {
            // Simulated 3-line analysis for photo
            finalContent = `**Visual Analysis:**\n1. Detected whiteboard schematic containing flow charts.\n2. Key entities identified: "User", "Database", "API Layer".\n3. Suggests a high-level architectural discussion context.`;
            formData.append('imageData', previewUrl);
        }

        if (mode === 'voice') {
            // Refine text for voice inputs (remove fillers)
            try {
                // If content was edited manually, use content. Else use transcript.
                const rawText = content || voiceTranscript;
                if (rawText) {
                    setIsSubmitting(true);
                    const { text } = await refineTextAction(rawText);
                    formData.append('content', text);
                } else {
                    formData.append('content', '');
                }
            } catch (e) {
                console.error('Refinement failed:', e);
                formData.append('content', content || voiceTranscript);
            }
        } else {
            formData.append('content', finalContent || voiceTranscript || '(File Upload Content Placeholder)');
        }

        formData.append('type', mode);
        formData.append('isAssignment', isAssignment.toString());

        try {
            const result = await addSessionInput(projectId, sessionId, formData);

            if (result?.error) {
                alert(`Failed to save: ${result.error}`);
                setIsSubmitting(false);
                return;
            }

            setIsSubmitting(false);
            onCancel(); // Close manager on success
        } catch (e: any) {
            console.error(e);
            alert(`System Error: ${e.message || 'Unknown error occurred'}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="geist-card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
            {/* TABS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', paddingBottom: '12px' }}>
                <TabButton active={mode === 'text'} onClick={() => setMode('text')}>Text</TabButton>
                <TabButton active={mode === 'voice'} onClick={() => setMode('voice')}>Voice</TabButton>
                <TabButton active={mode === 'upload'} onClick={() => setMode('upload')}>File</TabButton>
                <TabButton active={mode === 'photo'} onClick={() => setMode('photo')}>Photo</TabButton>
            </div>

            {isSubmitting ? (
                <div style={{ padding: '20px', animation: 'fadeIn 0.3s ease' }}>
                    <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '16px', background: 'var(--accents-2)', borderRadius: '4px' }} />
                    <div className="skeleton" style={{ height: '200px', width: '100%', marginBottom: '16px', background: 'var(--accents-2)', borderRadius: '8px' }} />
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div className="skeleton" style={{ height: '40px', flex: 1, background: 'var(--accents-2)', borderRadius: '999px' }} />
                        <div className="skeleton" style={{ height: '40px', flex: 1, background: 'var(--accents-2)', borderRadius: '999px' }} />
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '12px', color: 'var(--accents-4)', fontSize: '0.875rem' }}>Processing input...</p>
                    <style jsx>{`
                        @keyframes pulse {
                            0% { opacity: 0.6; }
                            50% { opacity: 1; }
                            100% { opacity: 0.6; }
                        }
                        .skeleton {
                            animation: pulse 1.5s infinite ease-in-out;
                        }
                    `}</style>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="SOURCE TITLE (Optional)"
                        className="geist-input"
                        style={{ marginBottom: '12px' }}
                    />

                    <div style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
                        {/* TEXT MODE */}
                        {mode === 'text' && (
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Paste text content here..."
                                className="geist-input"
                                style={{ flex: 1, resize: 'none', marginBottom: '0', height: '100%' }}
                                required
                            />
                        )}

                        {/* VOICE MODE */}
                        {mode === 'voice' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--accents-2)', borderRadius: '8px', height: '100%' }}>
                                <button
                                    type="button"
                                    onClick={handleVoiceToggle}
                                    className={`geist-btn ${isRecording ? 'error' : 'secondary'}`}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px' }}
                                >
                                    {isRecording ? 'STOP' : 'REC'}
                                </button>
                                <p style={{ color: 'var(--accents-5)' }}>
                                    {isRecording ? 'Listening...' : 'Click to start recording'}
                                </p>
                                <div style={{ textAlign: 'center', marginTop: '16px', maxHeight: '100px', overflowY: 'auto', fontSize: '0.9rem', color: '#fff', padding: '0 20px' }}>
                                    {voiceTranscript}
                                    <span style={{ opacity: 0.6 }}> {interimTranscript}</span>
                                </div>
                            </div>
                        )}

                        {/* UPLOAD MODE */}
                        {mode === 'upload' && (
                            <div
                                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--accents-2)', borderRadius: '8px', height: '100%' }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file) {
                                        setFileToUpload(file);
                                        setContent(`Uploaded file: ${file.name} (${file.type})`);
                                    }
                                }}
                            >
                                <p style={{ color: 'var(--accents-5)' }}>Drag & Drop files here</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--accents-3)' }}>PDF, DOC, MP3, WAV, Images</p>
                                {fileToUpload && <p style={{ marginTop: '10px', color: '#fff' }}>Selected: {fileToUpload.name}</p>}
                            </div>
                        )}

                        {/* PHOTO MODE */}
                        {mode === 'photo' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '12px', overflow: 'hidden' }}>
                                    {previewUrl ? (
                                        <div style={{ textAlign: 'center', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--accents-2)',
                                                    display: 'block',
                                                    margin: '0 auto'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewUrl(null);
                                                    setFileToUpload(null);
                                                    setContent('');
                                                }}
                                                className="geist-btn secondary"
                                                style={{
                                                    marginTop: '8px',
                                                    width: '100%',
                                                    borderColor: 'var(--accents-2)',
                                                    color: '#fff',
                                                    fontSize: '0.8rem',
                                                    padding: '4px'
                                                }}
                                            >
                                                RETAKE
                                            </button>
                                        </div>
                                    ) : (
                                        <CameraCapture onCapture={(file, url) => {
                                            setFileToUpload(file);
                                            setPreviewUrl(url);
                                            setContent(`Photo captured: ${file.name}`);
                                        }} />
                                    )}
                                </div>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Add a description for your photo (optional)"
                                    className="geist-input"
                                    rows={2}
                                    style={{ resize: 'none', marginBottom: '0' }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Optional content description for file/photo uploads */}
                    {/* Removed separate textarea block as it's now integrated */}

                    <div
                        onClick={() => setIsAssignment(!isAssignment)}
                        style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
                    >
                        <div style={{
                            width: '20px', height: '20px',
                            borderRadius: '4px',
                            border: isAssignment ? 'none' : '1px solid var(--accents-4)',
                            background: isAssignment ? '#fff' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}>
                            {isAssignment && <Check size={14} color="#000" />}
                        </div>
                        <span style={{ color: isAssignment ? '#fff' : 'var(--accents-5)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.02em', transition: 'color 0.2s' }}>
                            Core Assignment / Official Material
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="geist-btn"
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: '1px solid var(--accents-2)',
                                color: 'var(--accents-5)',
                                borderRadius: '999px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '0.875rem',
                                letterSpacing: '0.05em'
                            }}
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="geist-btn"
                            style={{
                                flex: 1,
                                background: 'var(--accents-1)',
                                border: '1px solid var(--accents-2)',
                                color: '#fff',
                                borderRadius: '999px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '0.875rem',
                                letterSpacing: '0.05em'
                            }}
                            disabled={isSubmitting || (mode !== 'text' && mode !== 'voice' && !fileToUpload)}
                        >
                            SAVE INPUT
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function TabButton({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                color: active ? '#fff' : 'var(--accents-5)',
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                borderRadius: '999px',
                transition: 'all 0.2s ease',
                fontWeight: 500,
                letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--accents-5)';
            }}
        >
            {children}
        </button>
    )
}

function CameraCapture({ onCapture }: { onCapture: (file: File, url: string) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Camera access denied or unavailable.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Attach stream to video element when available
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [stream]);

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');

            // Convert to File
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file, dataUrl);
                }
            }, 'image/jpeg');
            stopCamera();
        }
    };

    return (
        <div style={{ textAlign: 'center', background: '#000', borderRadius: '8px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {error ? (
                <div style={{ padding: '20px', color: 'red' }}>{error}</div>
            ) : (
                !stream ? (
                    <button
                        type="button"
                        onClick={startCamera}
                        title="Activate Camera"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--accents-2)',
                            borderRadius: '50%',
                            width: '80px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#fff',
                            margin: '0 auto',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {/* Using embedded SVG since @geist-ui/icons import might be missing/broken in this context or complex to verify */}
                        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                    </button>
                ) : (
                    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', maxHeight: '100%', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <button
                            type="button"
                            onClick={capturePhoto}
                            style={{
                                position: 'absolute',
                                bottom: '16px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#fff',
                                border: '4px solid rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                zIndex: 10,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                        />
                    </div>
                )
            )}
        </div>
    );
}
