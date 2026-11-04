import 'server-only';
import { endOfDay, startOfDay } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { cuid2 } from '@/features/shared/data-access/cuid2';
import { prisma } from '@/features/shared/data-access/prisma';

/*
 * Task queries on behalf of one user. The Server Actions and the MCP server both call these, so
 * "a user only ever touches their own tasks and projects" is enforced in one place: every query
 * is scoped by authorId, and a task can only be put into a project of the same user.
 */

export interface TaskFilters {
  readonly byProject?: string;
  readonly dueBy?: Date;
  readonly dueOn?: Date;
  readonly only?: 'completed' | 'incomplete';
  readonly onlyProject?: 'active' | 'archived';
  readonly orderBy?: 'completedAtAsc' | 'completedAtDesc' | 'createdAtAsc' | 'createdAtDesc';
  readonly take?: number;
}

export interface TaskData {
  readonly name: string;
  readonly description?: string | null;
  readonly dueDate?: Date | null;
  readonly completedAt?: Date | null;
  readonly projectId: string;
}

/*
 * dueBy and dueOn are wall-clock days: the day starts and ends in the user's time zone.
 */
export const listTasks = (
  userId: string,
  timeZone: string,
  { byProject, dueBy, dueOn, only, onlyProject, orderBy, take }: TaskFilters = {},
) => {
  if (dueBy && dueOn) {
    throw new Error('listTasks(): Only dueBy or dueOn arguments can be provided.');
  }

  const zone = timeZone || 'UTC';

  /*
   * Sensible default: order completed tasks by completedAt desc.
   */
  let _orderBy = orderBy;
  if (!_orderBy && only === 'completed') _orderBy = 'completedAtDesc';
  /**/

  let orderByQuery: { completedAt: 'asc' | 'desc' } | { createdAt: 'asc' | 'desc' };
  switch (_orderBy) {
    case 'completedAtAsc':
      orderByQuery = { completedAt: 'asc' };
      break;
    case 'completedAtDesc':
      orderByQuery = { completedAt: 'desc' };
      break;
    case 'createdAtAsc':
      orderByQuery = { createdAt: 'asc' };
      break;
    case 'createdAtDesc':
      orderByQuery = { createdAt: 'desc' };
      break;
    default:
      orderByQuery = { createdAt: 'asc' };
      break;
  }

  return prisma.task.findMany({
    where: {
      authorId: userId,
      ...(dueBy && { dueDate: { lte: zonedTimeToUtc(endOfDay(dueBy), zone) } }),
      ...(dueOn && {
        dueDate: {
          gte: zonedTimeToUtc(startOfDay(dueOn), zone),
          lte: zonedTimeToUtc(endOfDay(dueOn), zone),
        },
      }),
      ...(only && { completedAt: only === 'completed' ? { not: null } : null }),
      ...(byProject && { projectId: byProject }),
      ...(onlyProject && {
        project: { archivedAt: onlyProject === 'archived' ? { not: null } : null },
      }),
    },
    orderBy: orderByQuery,
    ...(take && { take }),
  });
};

export const findTask = (userId: string, id: string) =>
  prisma.task.findUnique({
    where: { authorId: userId, id },
    include: { project: true },
  });

export const createTask = (userId: string, { projectId, ...data }: TaskData) =>
  prisma.task.create({
    data: {
      ...data,
      id: cuid2(),
      author: { connect: { id: userId } },
      project: { connect: { id: projectId, authorId: userId } },
    },
  });

/*
 * dueDate and completedAt are null to clear them, and undefined to leave them as they are.
 */
export const updateTask = (userId: string, id: string, { projectId, ...data }: Partial<TaskData>) =>
  prisma.task.update({
    where: { id, authorId: userId },
    data: {
      ...data,
      ...(projectId && { project: { connect: { id: projectId, authorId: userId } } }),
    },
  });

export const deleteTask = (userId: string, id: string) =>
  prisma.task.delete({ where: { id, authorId: userId } });
