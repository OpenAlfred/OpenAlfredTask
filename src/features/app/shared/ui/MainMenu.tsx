import { Suspense } from 'react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { buttonIconClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { PlusSignalIcon } from '@/features/shared/ui/icon/PlusSignalIcon';
import { ProjectList } from '@/features/app/projects/ui/ProjectList';
import { ProjectListSkeleton } from '@/features/app/projects/ui/ProjectListSkeleton';
import { MainMenuLink } from './MainMenuLink';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { CalendarTodayIcon } from '@/features/shared/ui/icon/CalendarTodayIcon';
import { ProjectsIcon } from '@/features/shared/ui/icon/ProjectsIcon';

export const MainMenu = ({ className }: ClassNamePropsOptional) => {
  const activeClassName = 'bg-foreground/[0.07] text-foreground';
  const noProjects = <p className="px-2.5 py-1.5 text-sm text-muted-foreground">No projects yet</p>;

  return (
    <nav
      className={twMerge(
        'flex flex-col h-full w-full gap-0.5 overflow-y-auto overflow-x-hidden',
        'focus:outline-0 focus:ring-0 focus:outline-transparent focus:shadow-none',
        className,
      )}
    >
      <MainMenuLink activeClassName={activeClassName} href="/app/today">
        <CalendarTodayIcon className="text-primary" />
        Today
      </MainMenuLink>
      <div className="mt-4 flex items-center justify-between gap-1">
        <MainMenuLink
          activeClassName={activeClassName}
          className="grow"
          href="/app/projects/active"
        >
          <ProjectsIcon />
          Projects
        </MainMenuLink>
        <Link href="/app/projects/new" className={buttonIconClassName}>
          <span className="sr-only">Create project</span>
          <PlusSignalIcon width="1.25rem" height="1.25rem" />
        </Link>
      </div>
      <Suspense
        fallback={<ProjectListSkeleton className="mt-2 px-2.5" ssrOnly="Loading projects..." />}
      >
        <ProjectList
          activeItemClassName={activeClassName}
          className="gap-0.5"
          empty={noProjects}
          only="active"
        />
      </Suspense>
    </nav>
  );
};
