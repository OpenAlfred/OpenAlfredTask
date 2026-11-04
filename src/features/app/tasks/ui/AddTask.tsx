'use client';

import 'client-only';
import { Fragment } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { Transition } from '@headlessui/react';
import { twJoin, twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { ChildrenProps } from '@/features/shared/ui/ChildrenProps';
import { buttonLinkClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { PlusSignalIcon } from '@/features/shared/ui/icon/PlusSignalIcon';

export interface AddTaskProps extends ChildrenProps, ClassNamePropsOptional {
  readonly containerClassName?: string;
  readonly defaultDueDate?: 'today';
  readonly projectId?: string;
}

export const AddTask = ({
  children,
  className,
  containerClassName,
  defaultDueDate,
  projectId,
}: AddTaskProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { width } = useWindowSize();

  const isAddingTask = () => searchParams.get('newTask') !== null;

  const onAddTask = () => {
    if (width >= 768) {
      /*
       * Flavio Silva on Jan. 30th, 2024:
       *
       * We lift this "newTask=true" state to the URL instead of using useState() to make it possible
       * to have a "cancel" button in the <TaskForm> that changes this state to close <TaskForm>.
       *
       * <TaskForm> is passed as "children" to this component so it cannot pass props
       * to this component to tell it to stop rendering <TaskForm>.
       *
       * And since <TaskForm> is a Server Component, we cannot clone it to pass a function to it.
       * We cannot pass a function from a Client Component to a Server Component.
       *
       * By putting this state in the URL, all the "cancel" button in <TaskForm> has to do is
       * replace the current pathname plus the "newTask=true" query string with the pathname only,
       * without the query string.
       *
       * This is how the "cancel" button implements it:
       *
       * router.replace(pathname);
       *
       * It's a bit hacky, I give you that, but the use case is tricky.
       * I'd love to solve it in a better way. If you have an idea, please share it
       * in the discussions:
       *
       * https://github.com/flsilva/opentask/discussions
       */
      router.replace(`${pathname}?newTask=true`);
      /**/
    } else {
      const newTaskSearchParams = new URLSearchParams();
      if (defaultDueDate === 'today') newTaskSearchParams.set('defaultDueDate', 'today');
      if (projectId) newTaskSearchParams.set('projectId', projectId);
      router.push(`/app/tasks/new?${newTaskSearchParams.toString()}`);
    }
  };

  return (
    <div className={twJoin(containerClassName)}>
      <Transition
        show={!isAddingTask()}
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 -translate-y-[50px]"
        enterTo="opacity-100 translate-y-0"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-[50px]"
      >
        <button
          onClick={onAddTask}
          className={twMerge(
            buttonLinkClassName,
            'group gap-3 py-3 flex-row self-start',
            className,
          )}
        >
          <span className="flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <PlusSignalIcon aria-hidden="true" width="1rem" height="1rem" />
          </span>
          Add task
        </button>
      </Transition>
      <Transition
        show={isAddingTask()}
        as="div"
        enter="ease-out duration-300"
        enterFrom="opacity-0 translate-y-[50px]"
        enterTo="opacity-100 translate-y-0"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-[50px]"
      >
        {children}
      </Transition>
    </div>
  );
};
