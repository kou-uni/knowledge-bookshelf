import { ProjectService } from '@/lib/services/ProjectService';
import { ProjectDetailClient } from '@/components/ProjectDetailClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const projectService = new ProjectService();
    const project = await projectService.getProject(params.id);

    if (!project) {
        notFound();
    }

    return <ProjectDetailClient project={project} />;
}
