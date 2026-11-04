import 'server-only';
import { cuid2 } from '@/features/shared/data-access/cuid2';
import { prisma } from '@/features/shared/data-access/prisma';

/*
 * Project queries on behalf of one user. The Server Actions and the MCP server both call these,
 * so "a user only ever touches their own projects" is enforced in one place: every query is
 * scoped by authorId.
 */

export interface ProjectData {
  readonly name: string;
  readonly description?: string | null;
  readonly archivedAt?: Date | null;
}

export const listProjects = (userId: string, { isArchived }: { isArchived?: boolean } = {}) =>
  prisma.project.findMany({
    where: { authorId: userId, archivedAt: isArchived ? { not: null } : null },
    orderBy: isArchived ? { archivedAt: 'desc' } : { createdAt: 'asc' },
  });

/*
 * Every project name of the user, active or archived, by project id.
 */
export const listProjectNames = async (userId: string) =>
  new Map(
    (
      await prisma.project.findMany({
        where: { authorId: userId },
        select: { id: true, name: true },
      })
    ).map(({ id, name }) => [id, name]),
  );

export const findProject = (userId: string, id: string) =>
  prisma.project.findUnique({ where: { authorId: userId, id } });

export const createProject = (userId: string, data: ProjectData) =>
  prisma.project.create({
    data: { ...data, id: cuid2(), author: { connect: { id: userId } } },
  });

export const updateProject = (userId: string, id: string, data: Partial<ProjectData>) =>
  prisma.project.update({ where: { id, authorId: userId }, data });

export const deleteProject = (userId: string, id: string) =>
  prisma.project.delete({ where: { id, authorId: userId } });
