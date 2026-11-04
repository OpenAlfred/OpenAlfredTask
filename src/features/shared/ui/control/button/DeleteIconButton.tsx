'use client';

import { twMerge } from 'tailwind-merge';
import { DeleteIcon } from '../../icon/DeleteIcon';
import { buttonIconClassName } from './buttonClassName';
import { forwardRef } from 'react';

export interface DeleteIconButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

export const DeleteIconButton = forwardRef<HTMLButtonElement, DeleteIconButtonProps>(
  ({ className, ...rest }, ref) => (
    <button
      type="button"
      className={twMerge(
        buttonIconClassName,
        '[&:not(:disabled)]:hover:bg-destructive/10 [&:not(:disabled)]:hover:text-destructive',
        className,
      )}
      {...rest}
      ref={ref}
    >
      <span className="sr-only">Delete task</span>
      <DeleteIcon aria-hidden="true" />
    </button>
  ),
);

DeleteIconButton.displayName = 'DeleteIconButton';
