import { ProjectService } from '@/lib/services/ProjectService';

export const dynamic = 'force-dynamic';


const projectService = new ProjectService();

import { ProjectList } from '@/components/ProjectList';

export default async function Home() {
  await projectService.seedSampleData();
  const projects = await projectService.getAllProjects();

  return (
    <main style={{ padding: '80px 0' }} className="geist-container">
      <ProjectList projects={projects} />
    </main>
  );
}
