import { NoTasksInProject } from '@/features/app/projects/ui/NoTasksInProject';
import { ProjectPageHeader } from '@/features/app/projects/ui/ProjectPageHeader';
import { AddTask } from '@/features/app/tasks/ui/AddTask';
import { TaskList } from '@/features/app/tasks/ui/TaskList';
import { TaskForm } from '@/features/app/tasks/ui/TaskForm';

interface ProjectPageProps {
  readonly params: { readonly projectId: string };
}

export default function ProjectPage({ params: { projectId } }: ProjectPageProps) {
  return (
    <>
      <ProjectPageHeader id={projectId} />
      <NoTasksInProject id={projectId} />
      <TaskList byProject={projectId} only="incomplete" />
      <AddTask containerClassName="mt-1" projectId={projectId}>
        <TaskForm
          className="mt-3 rounded-xl border border-border bg-card p-3 shadow-sm"
          projectId={projectId}
          startOnEditingMode
        />
      </AddTask>
      <TaskList byProject={projectId} only="completed">
        {({ list, tasks }) =>
          tasks.length > 0 && (
            <>
              <h2 className="mt-10 flex items-baseline gap-2 pb-1 text-sm font-semibold text-muted-foreground">
                Completed <span className="text-xs font-medium">{tasks.length}</span>
              </h2>
              {list}
            </>
          )
        }
      </TaskList>
    </>
  );
}
