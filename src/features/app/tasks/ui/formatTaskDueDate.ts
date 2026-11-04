import { differenceInCalendarDays, format } from 'date-fns';

export const formatTaskDueDate = (date: Date | null | undefined, now: Date) => {
  if (!date || !now) return 'Due date';
  const diffDays = differenceInCalendarDays(date, now);

  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  if (diffDays > 1 && diffDays < 7) return format(date, 'EEEE');
  return format(date, 'MMM dd');
};

/*
 * Colors the due date by how close it is: overdue, today, tomorrow, later.
 */
export const getTaskDueDateClassName = (date: Date | null | undefined, now: Date) => {
  if (!date || !now) return 'text-muted-foreground';
  const diffDays = differenceInCalendarDays(date, now);

  if (diffDays < 0) return 'text-red-600 dark:text-red-400';
  if (diffDays === 0) return 'text-primary';
  if (diffDays === 1) return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
};
