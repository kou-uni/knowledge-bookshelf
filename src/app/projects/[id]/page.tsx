import { getProject } from '@/lib/store';
import { notFound } from 'next/navigation';
import { ProjectDetailClient } from '@/components/ProjectDetailClient';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
    const project = await getProject(params.id);

    if (!project) {
        notFound();
    }

    return <ProjectDetailClient project={project} />;
}
