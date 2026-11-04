'use server';

import 'server-only';
import { notFound } from 'next/navigation';
import { twJoin } from 'tailwind-merge';
import { ErrorList } from '@/features/shared/ui/error/ErrorList';
import { WarningFeedback } from '@/features/shared/ui/feedback/WarningFeedback';
import { PageHeader } from '@/features/app/shared/ui/PageHeader';
import { getProjectById } from '../data-access/ProjectsDataAccess';
import { ProjectMutationDropdown } from './ProjectMutationDropdown';
import { getProjectColorClassName } from './projectColorClassName';

export interface ProjectPageHeaderProps {
  readonly id: string;
}

export const ProjectPageHeader = async ({ id }: ProjectPageHeaderProps) => {
  const { data: project, errors } = await getProjectById(id);

  if (errors) return <ErrorList errors={errors} />;
  if (!project) return notFound();

  return (
    <div className="flex flex-col">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={twJoin(
                'h-3 w-3 shrink-0 rounded-full',
                getProjectColorClassName(project.id),
              )}
            />
            <span className="truncate">{project.name}</span>
          </span>
        }
        actions={<ProjectMutationDropdown project={project} />}
      />
      {project.description && (
        <p className="mb-4 block whitespace-pre-line text-sm text-muted-foreground">
          {project.description}
        </p>
      )}
      {project.archivedAt && (
        <WarningFeedback className="mb-6">
          <p className="block">This project is archived.</p>
        </WarningFeedback>
      )}
    </div>
  );
};
