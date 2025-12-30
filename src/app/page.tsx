import { getProjects, seedSampleData } from '@/lib/store';
import { ProjectList } from '@/components/ProjectList';

export default async function Home() {
  await seedSampleData();
  const projects = await getProjects();

  return (
    <main style={{ padding: '80px 0' }} className="geist-container">
      <ProjectList projects={projects} />
    </main>
  );
}
