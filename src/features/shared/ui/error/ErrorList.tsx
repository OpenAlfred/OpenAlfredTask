'use client';

import 'client-only';
import { useFormStatus } from 'react-dom';
import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { ServerError } from '@/features/shared/data-access/ServerResponse';

interface ErrorListProps extends ClassNamePropsOptional {
  readonly errors: Array<ServerError>;
}

export const ErrorList = ({ className, errors }: ErrorListProps) => {
  const { pending } = useFormStatus();
  if (pending || !errors || errors.length < 1) return null;

  return (
    <div
      role="alert"
      className={twMerge(
        'mb-4 flex flex-col gap-1 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2',
        className,
      )}
    >
      {errors.map((error) => (
        <p key={error.message} className="text-sm text-destructive">
          {error.message}
        </p>
      ))}
    </div>
  );
};
