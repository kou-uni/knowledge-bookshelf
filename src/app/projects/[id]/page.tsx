import { ProjectService } from '@/lib/services/ProjectService';
import { ProjectDetailClient } from '@/components/ProjectDetailClient';
import { notFound } from 'next/navigation';
import { Providers } from '@/components/Providers';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const projectService = new ProjectService();
    let project;
    try {
        project = await projectService.getProject(params.id);
    } catch (e) {
        console.warn("Failed to fetch project (build/migration):", e);
    }

    if (!project) {
        notFound();
    }

    return (
        <Providers>
            <ProjectDetailClient project={project} />
        </Providers>
    );
}
