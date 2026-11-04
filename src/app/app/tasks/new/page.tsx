import { PageHeader } from '@/features/app/shared/ui/PageHeader';
import { TaskForm } from '@/features/app/tasks/ui/TaskForm';

interface NewTaskPageProps {
  readonly searchParams: { readonly projectId: string };
}

export default function NewTaskPage({ searchParams: { projectId } }: NewTaskPageProps) {
  return (
    <div className="flex flex-col">
      <PageHeader title="Create task" />
      <TaskForm
        className="mt-2 rounded-xl border border-border bg-card p-3 shadow-sm"
        projectId={projectId}
        startOnEditingMode
      />
    </div>
  );
}
