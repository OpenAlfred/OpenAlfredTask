'use client';

import 'client-only';
import Link from 'next/link';
import { twJoin, twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { useIsPathActive } from '@/features/shared/routing/useIsPathActive';
import { getProjectColorClassName } from './projectColorClassName';

interface ProjectListItemProps extends ClassNamePropsOptional {
  readonly activeClassName?: string;
  readonly href: string;
  readonly id: string;
  readonly name: string;
}

export const ProjectListItem = ({
  activeClassName,
  className,
  href,
  id,
  name,
}: ProjectListItemProps) => {
  const _href = href.replace(':projectId', id);
  const isActive = useIsPathActive(_href);

  return (
    <Link
      href={_href}
      className={twMerge(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.9375rem] text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground md:py-1.5 md:text-sm',
        className,
        isActive && activeClassName,
      )}
    >
      <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center">
        <span className={twJoin('h-2 w-2 rounded-full', getProjectColorClassName(id))} />
      </span>
      <span className="truncate">{name}</span>
    </Link>
  );
};
