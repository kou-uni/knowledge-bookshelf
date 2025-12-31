import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SessionService } from '@/lib/services/SessionService';
import { ProjectService } from '@/lib/services/ProjectService';
import { SessionClient } from '@/components/SessionClient';

export default async function SessionPage({ params }: { params: { id: string; sessionId: string } }) {
    const sessionService = new SessionService();
    const projectService = new ProjectService();

    const session = await sessionService.getSession(params.id, params.sessionId);
    const project = await projectService.getProject(params.id);

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
