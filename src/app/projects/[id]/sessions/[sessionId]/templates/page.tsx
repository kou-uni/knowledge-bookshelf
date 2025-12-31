import { TemplateService } from '@/lib/services/TemplateService';
import { createTemplateAction, deleteTemplateAction } from '@/app/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage({ params }: { params: { id: string, sessionId: string } }) {
    const templateService = new TemplateService();
    const templates = await templateService.getTemplates();

    return (
        <main className="geist-container" style={{ padding: '80px 0', minHeight: '100vh' }}>
            <header style={{ marginBottom: '60px' }}>
                <Link href={`/ projects / ${params.id} /sessions/${params.sessionId} `} style={{
                    color: 'var(--accents-5)',
                    fontSize: '0.875rem',
                    marginBottom: '24px',
                    display: 'inline-block',
                    letterSpacing: '0.05em',
                    textDecoration: 'none'
                }}>
                    ← BACK TO SESSION
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ marginBottom: '8px', fontWeight: 100 }}>Instruction Archives</h1>
                        <p style={{ color: 'var(--accents-5)', fontSize: '1rem' }}>Manage your custom AI instruction templates.</p>
                    </div>
                </div>
            </header>

            <section style={{ marginBottom: '60px' }}>
                <div className="geist-card" style={{ marginBottom: '40px', borderColor: 'var(--accents-2)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 200, marginBottom: '20px' }}>Save New Template</h3>
                    <form action={createTemplateAction}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                name="title"
                                placeholder="Template Title (e.g. 'Detailed Summary', 'Key Insights')"
                                className="geist-input"
                                required
                            />
                            <textarea
                                name="content"
                                placeholder="Instruction content..."
                                className="geist-input"
                                rows={4}
                                required
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="geist-btn">SAVE TO ARCHIVE</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {templates.map(template => (
                        <div key={template.id} className="geist-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 400 }}>{template.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--accents-5)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {template.content}
                                </p>
                            </div>
                            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--accents-3)' }}>
                                    {new Date(template.createdAt).toLocaleDateString()}
                                </span>
                                <form action={async () => {
                                    'use server';
                                    await deleteTemplateAction(template.id);
                                }}>
                                    <button type="submit" className="geist-btn secondary" style={{ height: '32px', color: 'var(--geist-error)', borderColor: 'var(--accents-2)' }}>
                                        DELETE
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--accents-5)', border: '1px dashed var(--accents-2)' }}>
                            No archived instructions found.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
