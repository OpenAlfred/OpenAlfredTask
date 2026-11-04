'use server';

import 'server-only';
import { notFound } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { ClassNamePropsOptional } from '@/features/shared/ui/ClassNameProps';
import { buttonGreenClassName } from '@/features/shared/ui/control/button/buttonClassName';
import { SubmitButton } from '@/features/shared/ui/control/button/SubmitButton';
import { inputTextClassName } from '@/features/shared/ui/control/input/inputTextClassName';
import { ServerError } from '@/features/shared/data-access/ServerResponse';
import { ErrorList } from '@/features/shared/ui/error/ErrorList';
import { Form } from '@/features/shared/ui/form/Form';
import { FormErrorList } from '@/features/shared/ui/form/FormErrorList';
import {
  ProjectDto,
  createProject,
  getProjectById,
  updateProject,
} from '../data-access/ProjectsDataAccess';

export interface ProjectFormProps extends ClassNamePropsOptional {
  readonly projectId?: string;
}

export const ProjectForm = async ({ className, projectId }: ProjectFormProps) => {
  let project: ProjectDto | undefined | null;
  let errors: Array<ServerError> | undefined;

  if (projectId) ({ data: project, errors } = await getProjectById(projectId));
  if (errors) return <ErrorList errors={errors} />;
  if (projectId && !project) notFound();

  const name = (project && project.name) ?? '';
  const description = (project && project.description) ?? '';
  const formAction = project ? updateProject : createProject;

  return (
    <Form action={formAction} className={twMerge('flex flex-col', className)}>
      {project && <input type="hidden" name="id" value={project.id} />}
      <label htmlFor="project-name" className="text-sm font-medium">
        Name
      </label>
      <input
        autoFocus
        defaultValue={name}
        id="project-name"
        name="name"
        type="text"
        placeholder="Project name"
        className={twMerge(inputTextClassName, 'mb-5 mt-1.5')}
        required
        minLength={1}
        maxLength={500}
        autoComplete="off"
      />
      <label htmlFor="project-description" className="text-sm font-medium">
        Description <span className="font-normal text-muted-foreground">(optional)</span>
      </label>
      <textarea
        defaultValue={description}
        id="project-description"
        name="description"
        placeholder="What is this project about?"
        rows={4}
        maxLength={500}
        className={twMerge(inputTextClassName, 'mb-6 mt-1.5 resize-none')}
      ></textarea>
      <FormErrorList />
      <SubmitButton className={twMerge(buttonGreenClassName, 'flex self-end')}>Save</SubmitButton>
    </Form>
  );
};
