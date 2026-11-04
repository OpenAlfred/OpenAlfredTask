'use client';

import 'client-only';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { CheckIcon } from '@/features/shared/ui/icon/CheckIcon';
import { ServerResponse } from '@/features/shared/data-access/ServerResponse';
import { TaskDto, updateTask } from '../data-access/TasksDataAccess';
import { TaskCheckSize } from './TaskCheckSize';

export interface TaskCheckProps extends ClassNamePropsOptional {
  readonly completedAt: Date | null | undefined;
  readonly onClick?: (response: ServerResponse<TaskDto | undefined>) => void;
  readonly size: TaskCheckSize;
  readonly taskId?: string;
}

/*
 * Flavio Silva on Nov. 22:
 *
 * revalidatePath() and revalidateTag() break the app when used in Intercepting Routes:
 *
 * GitHub issue:
 * https://github.com/vercel/next.js/issues/58772
 *
 * So I made TaskCheck a Client Component to be able to use router.refresh() after updating the task,
 * but it turns out router.refresh() doesn't work either on Intercepting Routes, as described below.
 *
 */
export const TaskCheck = ({ className, completedAt, onClick, size, taskId }: TaskCheckProps) => {
  const router = useRouter();

  /*
   * Shows the new state right away instead of after the server round trip.
   * It's dropped as soon as the task comes back from the server.
   */
  const [optimisticIsCompleted, setOptimisticIsCompleted] = useState<boolean>();
  const isCompleted = optimisticIsCompleted ?? Boolean(completedAt);

  useEffect(() => {
    setOptimisticIsCompleted(undefined);
  }, [completedAt]);
  /**/

  const onCheckClick = async () => {
    if (!taskId) return;

    setOptimisticIsCompleted(!completedAt);

    const formData = new FormData();
    formData.append('id', taskId);
    formData.append('completedAt', completedAt ? 'null' : new Date().toString());

    const response = await updateTask(undefined, formData);
    if (response.errors) setOptimisticIsCompleted(undefined);

    /*
     * Flavio Silva on Nov. 22:
     * The following router.refresh() works when we're completing / undoing tasks in a task list,
     * but it doesn't work as expected when we're completing a task in a Dialog in the
     * Intercepting Route "app/tasks/[taskId]".
     * The Server Component of the page segment does rerender (TaskDialogPage) and
     * refetches the updated task, the <TaskForm> Server Component does rerender, but
     * Client Components don't rerender. I saw this behavior in Next.js 13.5.x.
     *
     * GitHub issue:
     * https://github.com/vercel/next.js/issues/51310
     */
    // router.refresh() is necessary to refetch and rerender mutated data.
    router.refresh();

    /*
     * This is a workaround for this issue, so <TaskFormTextFields> can update itself
     * according to the updated completedAt data.
     */
    if (onClick) onClick(response);
    /**/
  };

  return (
    <button
      type="button"
      aria-label={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
      className="group flex shrink-0 self-start rounded-full"
      onClick={onCheckClick}
    >
      <span
        className={twMerge(
          'flex items-center justify-center rounded-full border-[1.5px] transition-all duration-150 active:scale-90',
          size === TaskCheckSize.Medium ? 'h-[1.125rem] w-[1.125rem]' : 'h-6 w-6',
          isCompleted
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/60 text-transparent group-hover:border-primary group-hover:bg-primary/10 group-hover:text-primary',
          className,
        )}
      >
        <CheckIcon
          aria-hidden="true"
          width={size === TaskCheckSize.Medium ? '0.875rem' : '1.125rem'}
          height={size === TaskCheckSize.Medium ? '0.875rem' : '1.125rem'}
        />
      </span>
    </button>
  );
};
