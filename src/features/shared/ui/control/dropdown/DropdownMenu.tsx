'use client';

import 'client-only';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { twJoin, twMerge } from 'tailwind-merge';
import { ChildrenProps } from '@/features/shared/ui/ChildrenProps';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';

export const getDropdownMenuItemClassName = (active: boolean, destructive = false) =>
  twJoin(
    'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm',
    destructive ? 'text-destructive' : 'text-foreground',
    active && (destructive ? 'bg-destructive/10' : 'bg-muted'),
  );

export interface DropdownMenuProps extends ChildrenProps, ClassNamePropsOptional {
  readonly itemsClassName?: string;
  readonly menuButton: React.ReactNode;
}

export const DropdownMenu = ({
  children,
  className,
  itemsClassName,
  menuButton,
}: DropdownMenuProps) => {
  return (
    <div {...(className && { className })}>
      <Menu as="div" className="relative inline-block w-full text-left">
        <div>{menuButton}</div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={twMerge(
              'overflow-auto rounded-xl border border-border bg-card shadow-lg shadow-black/5 focus:outline-none dark:shadow-black/40',
              itemsClassName,
            )}
          >
            <div className="p-1">{children}</div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
