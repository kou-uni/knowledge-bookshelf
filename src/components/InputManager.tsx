'use client';

import { useState, useRef } from 'react';
import { addSessionInput } from '@/app/actions';

type InputMode = 'text' | 'voice' | 'upload' | 'photo';

export function InputManager({ projectId, sessionId, onCancel }: { projectId: string; sessionId: string; onCancel: () => void }) {
    const [mode, setMode] = useState<InputMode>('text');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');

    // Common State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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
                    let final_transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final_transcript += event.results[i][0].transcript;
                        }
                    }
                    if (final_transcript) {
                        setVoiceTranscript(prev => prev + ' ' + final_transcript);
                        setContent(prev => prev + ' ' + final_transcript);
                    }
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
        formData.append('content', content || voiceTranscript || '(File Upload Content Placeholder)'); // Fallback/Mock
        formData.append('type', mode);

        await addSessionInput(projectId, sessionId, formData);
        setIsSubmitting(false);
        onCancel(); // Close manager on success
    };

    return (
        <div className="geist-card" style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
            {/* TABS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--accents-2)', paddingBottom: '12px' }}>
                <TabButton active={mode === 'text'} onClick={() => setMode('text')}>Text</TabButton>
                <TabButton active={mode === 'voice'} onClick={() => setMode('voice')}>Voice</TabButton>
                <TabButton active={mode === 'upload'} onClick={() => setMode('upload')}>File</TabButton>
                <TabButton active={mode === 'photo'} onClick={() => setMode('photo')}>Photo</TabButton>
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="SOURCE TITLE"
                    className="geist-input"
                    required
                    style={{ marginBottom: '12px' }}
                />

                {/* TEXT MODE */}
                {mode === 'text' && (
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Paste text content here..."
                        className="geist-input"
                        rows={6}
                        style={{ marginBottom: '12px' }}
                        required
                    />
                )}

                {/* VOICE MODE */}
                {mode === 'voice' && (
                    <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed var(--accents-2)', marginBottom: '12px' }}>
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
                        <div style={{ textAlign: 'left', marginTop: '16px', maxHeight: '100px', overflowY: 'auto', fontSize: '0.9rem', color: '#fff' }}>
                            {voiceTranscript}
                        </div>
                    </div>
                )}

                {/* UPLOAD MODE */}
                {mode === 'upload' && (
                    <div
                        style={{ padding: '60px', textAlign: 'center', border: '2px dashed var(--accents-2)', marginBottom: '12px', borderRadius: '8px' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setContent(`Uploaded file: ${e.dataTransfer.files[0].name} (${e.dataTransfer.files[0].type})`);
                        }}
                    >
                        <p style={{ color: 'var(--accents-5)' }}>Drag & Drop files here</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--accents-3)' }}>PDF, DOC, MP3, WAV, Images</p>
                    </div>
                )}

                {/* PHOTO MODE */}
                {mode === 'photo' && (
                    <div style={{ marginBottom: '12px' }}>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => setContent(`Photo captured: ${e.target.files?.[0]?.name}`)}
                            className="geist-input"
                        />
                    </div>
                )}

                {/* HIDDEN INPUT FOR CONSISTENCY IF NEEDED */}
                {(mode === 'upload' || mode === 'photo' || mode === 'voice') && (
                    <textarea
                        value={content}
                        readOnly
                        style={{ display: 'none' }}
                    />
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={onCancel} className="geist-btn secondary" style={{ flex: 1 }}>CANCEL</button>
                    <button type="submit" className="geist-btn" style={{ flex: 1 }} disabled={isSubmitting}>SAVE INPUT</button>
                </div>
            </form>
        </div>
    );
}

function TabButton({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid #fff' : '2px solid transparent',
                color: active ? '#fff' : 'var(--accents-5)',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
            }}
        >
            {children}
        </button>
    )
}
