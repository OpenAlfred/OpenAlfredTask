import { ErrorList } from '@/features/shared/ui/error/ErrorList';
import { getTasks } from '@/features/app/tasks/data-access/TasksDataAccess';

interface NoTasksInProjectProps {
  readonly id: string;
}

export const NoTasksInProject = async ({ id }: NoTasksInProjectProps) => {
  const { data: tasks, errors } = await getTasks({
    byProject: id,
  });

  if (errors) return <ErrorList errors={errors} />;
  if (!tasks || tasks.length > 0) return null;

  return <p className="py-3 text-sm text-muted-foreground">No tasks in this project yet.</p>;
};
