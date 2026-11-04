import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { subDays } from 'date-fns';
import { twJoin } from 'tailwind-merge';
import { ErrorList } from '@/features/shared/ui/error/ErrorList';
import { CheckIcon } from '@/features/shared/ui/icon/CheckIcon';
import { getProjects } from '@/features/app/projects/data-access/ProjectsDataAccess';
import { AddTask } from '@/features/app/tasks/ui/AddTask';
import { TaskForm } from '@/features/app/tasks/ui/TaskForm';
import { TaskList } from '@/features/app/tasks/ui/TaskList';
import { TaskListSkeleton } from '@/features/app/tasks/ui/TaskListSkeleton';
import { TodayPageHeader } from '@/features/app/today/ui/TodayPageHeader';

const sectionHeadingClassName = 'flex items-baseline gap-2 pb-1 text-sm font-semibold';

const TaskCount = ({ count }: { readonly count: number }) => (
  <span className="text-xs font-medium text-muted-foreground">{count}</span>
);

export default async function TodayPage() {
  const { data: projects, errors } = await getProjects();
  if (errors) return <ErrorList errors={errors} />;
  if (!projects || projects.length <= 0) redirect('/app/onboarding');

  const yesterday = subDays(new Date(), 1);
  const today = new Date();

  return (
    <>
      <TodayPageHeader />
      <Suspense fallback={<TaskListSkeleton className="mt-3" ssrOnly="Loading tasks..." />}>
        <TaskList dueBy={yesterday} only="incomplete" onlyProject="active" projects={projects}>
          {({ list: listOverdue, tasks: tasksOverdue }) => (
            <>
              {tasksOverdue.length > 0 && (
                <h2
                  className={twJoin(sectionHeadingClassName, 'mt-2 text-red-600 dark:text-red-400')}
                >
                  Overdue <TaskCount count={tasksOverdue.length} />
                </h2>
              )}
              {listOverdue}

              <TaskList dueOn={today} only="incomplete" onlyProject="active" projects={projects}>
                {({ list: listDueToday, tasks: tasksDueToday }) => (
                  <>
                    {tasksOverdue.length > 0 && (
                      <h2 className={twJoin(sectionHeadingClassName, 'mt-8')}>
                        Today{' '}
                        {tasksDueToday.length > 0 && <TaskCount count={tasksDueToday.length} />}
                      </h2>
                    )}
                    {listDueToday}
                    {tasksDueToday.length < 1 &&
                      (tasksOverdue.length > 0 ? (
                        <p className="py-3 text-sm text-muted-foreground">No tasks due today.</p>
                      ) : (
                        <div className="flex flex-col items-center py-14 text-center">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <CheckIcon aria-hidden="true" width="1.75rem" height="1.75rem" />
                          </span>
                          <p className="mt-4 font-semibold">All clear for today</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            No tasks due today. Enjoy your day!
                          </p>
                        </div>
                      ))}
                  </>
                )}
              </TaskList>
            </>
          )}
        </TaskList>
        <AddTask containerClassName="mt-1" defaultDueDate="today">
          <TaskForm
            className="mt-3 rounded-xl border border-border bg-card p-3 shadow-sm"
            defaultDueDate={today}
            startOnEditingMode
          />
        </AddTask>
      </Suspense>
    </>
  );
}
