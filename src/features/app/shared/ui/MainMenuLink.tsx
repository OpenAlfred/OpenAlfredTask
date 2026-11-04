'use client';

import 'client-only';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { ChildrenProps } from '@/features/shared/ui/ChildrenProps';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { useIsPathActive } from '@/features/shared/routing/useIsPathActive';

export interface MainMenuLinkProps extends ChildrenProps, ClassNamePropsOptional {
  readonly activeClassName?: string;
  readonly href: string;
}

export const MainMenuLink = ({ activeClassName, children, className, href }: MainMenuLinkProps) => {
  const isActive = useIsPathActive(href);

  return (
    <Link
      href={href}
      className={twMerge(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground md:py-1.5 md:text-sm',
        className,
        isActive && activeClassName,
      )}
    >
      {children}
    </Link>
  );
};
