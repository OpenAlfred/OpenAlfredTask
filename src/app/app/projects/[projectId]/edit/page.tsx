import { Suspense } from 'react';
import { PageHeader } from '@/features/app/shared/ui/PageHeader';
import { ProjectForm } from '@/features/app/projects/ui/ProjectForm';
import { ProjectFormSkeleton } from '@/features/app/projects/ui/ProjectFormSkeleton';

interface EditProjectPageProps {
  readonly params: { readonly projectId: string };
}

export default function EditProjectPage({ params: { projectId } }: EditProjectPageProps) {
  return (
    <div className="flex flex-col">
      <PageHeader title="Edit project" />
      <Suspense fallback={<ProjectFormSkeleton className="mt-2" ssrOnly="Loading project..." />}>
        <ProjectForm className="mt-2 max-w-xl" projectId={projectId} />
      </Suspense>
    </div>
  );
}
