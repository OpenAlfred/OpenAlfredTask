'use server';

import 'server-only';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  ServerResponse,
  createServerErrorResponse,
  createServerSuccessResponse,
} from '@/features//shared/data-access/ServerResponse';
import { genericAwareOfInternalErrorMessage } from '@/features/shared/ui/error/errorMessages';
import { getServerSideUser } from '@/features/app/users/data-access/UsersDataAccess';
import {
  createProjectSchema,
  deleteProjectSchema,
  updateProjectSchema,
} from '../domain/ProjectsDomain';
import * as projectsService from '../service/ProjectsService';

export type CreateProjectDto = z.infer<typeof createProjectSchema>;

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;

export type ProjectDto = CreateProjectDto & { id: string };

export const createProject = async (
  prevResponse: ServerResponse<ProjectDto> | undefined,
  formData: FormData,
) => {
  const validation = createProjectSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    console.error(validation.error);

    // return Zod validation errors.
    return createServerErrorResponse<ProjectDto>(validation.error);
  }

  let result;

  try {
    const { id } = await getServerSideUser();

    result = await projectsService.createProject(id, validation.data);
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the unknown real one.
    return createServerErrorResponse<ProjectDto>(genericAwareOfInternalErrorMessage);
  }

  redirect(`/app/projects/${result.id}`);
};

export const deleteProject = async (
  prevResponse: ServerResponse<ProjectDto> | undefined,
  formData: FormData,
) => {
  const validation = deleteProjectSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    console.error(validation.error);

    // return Zod validation errors.
    return createServerErrorResponse<ProjectDto>(validation.error);
  }

  try {
    const { id } = validation.data;
    const { id: authorId } = await getServerSideUser();

    await projectsService.deleteProject(authorId, id);
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<ProjectDto>(genericAwareOfInternalErrorMessage);
  }

  redirect('/app/today');
};

export const getProjects = async ({ isArchived }: { isArchived?: boolean } = {}) => {
  try {
    const { id: authorId } = await getServerSideUser();

    const result = await projectsService.listProjects(authorId, { isArchived });
    return createServerSuccessResponse(result);
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<ProjectDto[]>(genericAwareOfInternalErrorMessage);
  }
};

export const getProjectById = async (id: string) => {
  try {
    const { id: authorId } = await getServerSideUser();

    const result = await projectsService.findProject(authorId, id);

    return createServerSuccessResponse(result);
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<ProjectDto>(genericAwareOfInternalErrorMessage);
  }
};

export const updateProject = async (
  prevResponse: ServerResponse<ProjectDto> | undefined,
  formData: FormData,
) => {
  const validation = updateProjectSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    console.error(validation.error);

    // return Zod validation errors.
    return createServerErrorResponse<ProjectDto>(validation.error);
  }

  let result;

  try {
    const { id, ...data } = validation.data;
    const { id: authorId } = await getServerSideUser();

    result = await projectsService.updateProject(authorId, id, data);
  } catch (error) {
    console.error(error);

    // return a friendly error message instead of the (unknown) real one.
    return createServerErrorResponse<ProjectDto>(genericAwareOfInternalErrorMessage);
  }

  redirect(`/app/projects/${result.id}`);
};
