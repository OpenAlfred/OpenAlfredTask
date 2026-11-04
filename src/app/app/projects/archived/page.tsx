import { Suspense } from 'react';
import { ProjectList } from '@/features/app/projects/ui/ProjectList';
import { ProjectListSkeleton } from '@/features/app/projects/ui/ProjectListSkeleton';
import { ProjectsPageHeader } from '@/features/app/projects/ui/ProjectsPageHeader';
import {
  projectListClassName,
  projectListEmptyClassName,
  projectListItemClassName,
} from '@/features/app/projects/ui/projectListClassName';

export default function ArchivedProjectsPage() {
  const empty = <p className={projectListEmptyClassName}>No archived projects.</p>;

  return (
    <>
      <ProjectsPageHeader archived={true} />
      <Suspense fallback={<ProjectListSkeleton ssrOnly="Loading projects..." />}>
        <ProjectList
          className={projectListClassName}
          empty={empty}
          itemClassName={projectListItemClassName}
          only="archived"
        />
      </Suspense>
    </>
  );
}
