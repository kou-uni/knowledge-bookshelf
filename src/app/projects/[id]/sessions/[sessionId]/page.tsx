import { getSession } from '@/lib/store';
import { notFound } from 'next/navigation';
import { SessionClient } from '@/components/SessionClient';
import Link from 'next/link';

export default async function SessionDetailPage({ params }: { params: { id: string; sessionId: string } }) {
    const data = await getSession(params.id, params.sessionId);

    if (!data) {
        notFound();
    }

    const { project, session } = data;

    return (
        <main style={{ padding: '40px 0', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accents-5)', fontSize: '0.9rem' }}>
                    <Link href="/">Dashboard</Link>
                    <span>/</span>
                    <Link href={`/projects/${project.id}`}>{project.title}</Link>
                    <span>/</span>
                    <span>Session {session.sessionNumber}</span>
                </div>
                <h1 style={{ fontSize: '2rem' }}>{session.title}</h1>
            </header>

            <SessionClient project={project} session={session} />
        </main>
    );
}
