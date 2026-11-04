import { twMerge } from 'tailwind-merge';
import { ChildrenProps } from '@/features/shared/ui/ChildrenProps';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { WarningIcon } from '@/features/shared/ui/icon/WarningIcon';

interface WarningFeedbackProps extends ChildrenProps, ClassNamePropsOptional {}

export const WarningFeedback = ({ children, className }: WarningFeedbackProps) => (
  <div
    className={twMerge(
      'flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200',
      className,
    )}
  >
    <WarningIcon className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
    <div className="flex whitespace-pre-line">{children}</div>
  </div>
);
