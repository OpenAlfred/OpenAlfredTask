'use server';

import 'server-only';
import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { getServerSideUser } from '@/features/app/users/data-access/UsersDataAccess';
import { ProjectDto } from '@/features/app/projects/data-access/ProjectsDataAccess';
import { GetTasksParams, TaskDto, getTasks } from '../data-access/TasksDataAccess';
import { TaskListItem } from './TaskListItem';
import { ErrorList } from '@/features/shared/ui/error/ErrorList';

export interface TaskListProps extends GetTasksParams, ClassNamePropsOptional {
  readonly children?: ({
    list,
    tasks,
  }: {
    readonly list: React.ReactNode;
    readonly tasks: Array<TaskDto>;
  }) => React.ReactNode;
  /*
   * Pass the projects to show the project of each task, for lists that mix several projects.
   */
  readonly projects?: Array<ProjectDto>;
}

/*
 * I'm suppressing the following TypeScript error that seems to be an issue
 * with React types for async components:
 *
 * "Type is referenced directly or indirectly in the fulfillment callback of its own 'then' method.ts(1062)"
 */
// @ts-ignore
export const TaskList = async ({ children, className, projects, ...rest }: TaskListProps) => {
  const [{ timeZone }, { data: tasks, errors }] = await Promise.all([
    getServerSideUser(),
    getTasks(rest),
  ]);

  if (errors) return <ErrorList errors={errors} />;

  let list = null;

  if (tasks && tasks.length > 0) {
    list = (
      <div className={twMerge('flex flex-col', className)}>
        {tasks.map((task) => (
          <div key={task.id} className="flex border-b border-border">
            <TaskListItem
              completedAt={task.completedAt}
              description={task.description || ''}
              dueDate={task.dueDate}
              id={task.id}
              key={task.id}
              name={task.name}
              project={projects?.find((project) => project.id === task.projectId)}
              timeZone={timeZone}
            />
          </div>
        ))}
      </div>
    );
  }

  return typeof children === 'function' ? children({ list, tasks: tasks ?? [] }) : list;
};
