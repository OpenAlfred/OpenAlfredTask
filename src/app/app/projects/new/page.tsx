import { PageHeader } from '@/features/app/shared/ui/PageHeader';
import { ProjectForm } from '@/features/app/projects/ui/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Create project" />
      <ProjectForm className="mt-2 max-w-xl" />
    </div>
  );
}
