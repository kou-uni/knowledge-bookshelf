import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SessionService } from '@/lib/services/SessionService';
import { ProjectService } from '@/lib/services/ProjectService';
import { SessionClient } from '@/components/SessionClient';

export const dynamic = 'force-dynamic';

export default async function SessionPage({ params }: { params: { id: string; sessionId: string } }) {
    const sessionService = new SessionService();
    const projectService = new ProjectService();

    let session, project;
    try {
        session = await sessionService.getSession(params.id, params.sessionId);
        project = await projectService.getProject(params.id);
    } catch (e) {
        console.warn("Failed to fetch session/project (build/migration):", e);
    }

    if (!session || !project) {
        notFound();
    }

    const data = { project, session };

    return (
        <>
            <SessionClient project={project} session={session} />
        </>
    );
}
