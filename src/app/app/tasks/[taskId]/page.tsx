import { TaskForm } from '@/features/app/tasks/ui/TaskForm';

interface TaskPageProps {
  readonly params: { readonly taskId: string };
}

export default function TaskPage({ params: { taskId } }: TaskPageProps) {
  return (
    <TaskForm className="mt-8 md:mt-12" taskId={taskId} taskNameClassName="text-xl font-semibold" />
  );
}
