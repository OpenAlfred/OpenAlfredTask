import Link from 'next/link';
import { sanitize } from 'isomorphic-dompurify';
import { utcToZonedTime } from 'date-fns-tz';
import { CalendarEventIcon } from '@/features/shared/ui/icon/CalendarEventIcon';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { getProjectColorClassName } from '@/features/app/projects/ui/projectColorClassName';
import { TaskCheck } from './TaskCheck';
import { TaskCheckSize } from './TaskCheckSize';
import { twJoin, twMerge } from 'tailwind-merge';
import { formatTaskDueDate, getTaskDueDateClassName } from './formatTaskDueDate';

export interface TaskListItemProps extends ClassNamePropsOptional {
  readonly completedAt: Date | null | undefined;
  readonly description: string;
  readonly dueDate: Date | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly project?: { readonly id: string; readonly name: string };
  readonly timeZone: string;
}

export const TaskListItem = ({
  className,
  completedAt,
  description,
  dueDate,
  id,
  name,
  project,
  timeZone,
}: TaskListItemProps) => {
  const zonedDueDate = dueDate && utcToZonedTime(dueDate, timeZone);
  const zonedNow = utcToZonedTime(new Date(), timeZone);

  return (
    <div className={twMerge('flex min-w-0 grow items-start gap-3 py-3', className)}>
      <TaskCheck
        className="mt-[3px]"
        completedAt={completedAt}
        size={TaskCheckSize.Medium}
        taskId={id}
      />
      <Link href={`/app/tasks/${id}`} className="flex min-w-0 grow flex-col rounded-md text-left">
        <div
          className={twJoin(
            'text-sm leading-6',
            completedAt ? 'text-muted-foreground line-through' : 'text-foreground',
          )}
          dangerouslySetInnerHTML={{ __html: sanitize(name) }}
        />
        {description && (
          <div
            className="max-h-5 truncate text-xs leading-5 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitize(description) }}
          />
        )}
        {(zonedDueDate || project) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {zonedDueDate && (
              <span
                className={twJoin(
                  'flex items-center gap-1',
                  completedAt
                    ? 'text-muted-foreground'
                    : getTaskDueDateClassName(zonedDueDate, zonedNow),
                )}
              >
                <CalendarEventIcon aria-hidden="true" width="0.875rem" height="0.875rem" />
                {formatTaskDueDate(zonedDueDate, zonedNow)}
              </span>
            )}
            {project && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  aria-hidden="true"
                  className={twJoin('h-2 w-2 rounded-full', getProjectColorClassName(project.id))}
                />
                {project.name}
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  );
};
