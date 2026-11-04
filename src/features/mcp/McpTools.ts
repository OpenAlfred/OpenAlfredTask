import 'server-only';
import type { CallToolResult, McpServer } from '@modelcontextprotocol/server';
import type { Project, Task } from '@prisma/client';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { z } from 'zod';
import type { VerifiedApiToken } from '@/features/app/api-tokens/service/ApiTokensService';
import * as projectsService from '@/features/app/projects/service/ProjectsService';
import * as tasksService from '@/features/app/tasks/service/TasksService';
import type { TaskData } from '@/features/app/tasks/service/TasksService';

/*
 * The tools an AI assistant gets once it's connected with an API token. They call the same
 * services as the app, scoped to the owner of the token.
 *
 * Dates are calendar days ("2026-11-04") in the user's time zone. The app stores a due date as an
 * instant, so a day is saved as noon in that zone, which keeps the task on its day.
 */

const DEFAULT_TASK_LIMIT = 50;
const MAX_TASK_LIMIT = 200;

class ToolError extends Error {}

const isRealDay = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);
  const parsed = new Date(year, month - 1, date);

  return (
    parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === date
  );
};

// The task filters take a local Date and read it as a wall-clock day.
const toWallClockDate = (day: string) => {
  const [year, month, date] = day.split('-').map(Number);

  return new Date(year, month - 1, date);
};

const toDueInstant = (day: string, timeZone: string) =>
  zonedTimeToUtc(`${day}T12:00:00`, timeZone || 'UTC');

const toDay = (date: Date, timeZone: string) =>
  formatInTimeZone(date, timeZone || 'UTC', 'yyyy-MM-dd');

const idSchema = (what: string) => z.string().min(1).max(64).describe(`The id of the ${what}.`);

const daySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')
  .refine(isRealDay, 'That is not a real calendar date.');

const nameSchema = z.string().trim().min(1).max(500);

const toProjectDto = ({ id, name, description, archivedAt, createdAt }: Project) => ({
  id,
  name,
  description,
  archived: archivedAt !== null,
  created_at: createdAt.toISOString(),
});

const toTaskDto = (
  { id, name, description, projectId, dueDate, completedAt, createdAt }: Task,
  timeZone: string,
  projectName?: string,
) => ({
  id,
  name,
  description,
  project_id: projectId,
  project: projectName ?? null,
  due_date: dueDate ? toDay(dueDate, timeZone) : null,
  completed: completedAt !== null,
  completed_at: completedAt ? completedAt.toISOString() : null,
  created_at: createdAt.toISOString(),
});

const isNotFoundError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025';

/*
 * Runs a tool and turns what it returns into the JSON text an assistant reads. Errors the
 * assistant can act on come back as a result with isError set instead of a protocol error.
 */
const run = async (action: () => Promise<unknown>, notFound: string): Promise<CallToolResult> => {
  try {
    return { content: [{ type: 'text', text: JSON.stringify(await action(), null, 2) }] };
  } catch (error) {
    if (error instanceof ToolError)
      return { content: [{ type: 'text', text: error.message }], isError: true };
    if (isNotFoundError(error))
      return { content: [{ type: 'text', text: notFound }], isError: true };

    console.error(error);
    return {
      content: [{ type: 'text', text: 'Something went wrong on the server.' }],
      isError: true,
    };
  }
};

export const getInstructions = ({ timeZone }: VerifiedApiToken) => {
  const zone = timeZone || 'UTC';

  return [
    "OpenTask is the user's personal task manager. Tasks live in projects, and every task belongs to exactly one project.",
    `Today is ${formatInTimeZone(new Date(), zone, 'EEEE, yyyy-MM-dd')} (time zone ${zone}). Dates are calendar days written as YYYY-MM-DD.`,
    'Call list_projects first to learn the project ids.',
    'list_tasks returns open tasks of active projects. Pass status "completed" or "all" to include finished ones.',
    'Mark a task as done with complete_task instead of deleting it. Deleting cannot be undone.',
  ].join('\n');
};

export const registerTools = (server: McpServer, { userId, timeZone }: VerifiedApiToken) => {
  const getProjectName = async (projectId: string) =>
    (await projectsService.listProjectNames(userId)).get(projectId);

  /*
   * Applies the changes to a task. "completed" only touches completedAt when the state changes,
   * so completing a finished task again keeps the date it was first completed.
   */
  const changeTask = async (id: string, patch: Partial<TaskData>, completed?: boolean) => {
    const hasPatch = Object.keys(patch).length > 0;

    if (!hasPatch && completed === undefined) {
      throw new ToolError('Nothing to update. Pass at least one field to change.');
    }

    let task: Task | null = hasPatch
      ? await tasksService.updateTask(userId, id, patch)
      : await tasksService.findTask(userId, id);

    if (!task) throw new ToolError('Task not found.');

    if (completed !== undefined && Boolean(task.completedAt) !== completed) {
      task = await tasksService.updateTask(userId, id, {
        completedAt: completed ? new Date() : null,
      });
    }

    return toTaskDto(task, timeZone, await getProjectName(task.projectId));
  };

  server.registerTool(
    'list_projects',
    {
      title: 'List projects',
      description:
        "Lists the user's projects with their ids. Active projects, unless archived is true.",
      inputSchema: z.object({
        archived: z.boolean().optional().describe('List archived projects instead of active ones.'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ archived }) =>
      run(
        async () =>
          (await projectsService.listProjects(userId, { isArchived: archived })).map(toProjectDto),
        'Projects not found.',
      ),
  );

  server.registerTool(
    'create_project',
    {
      title: 'Create project',
      description: 'Creates a project. Tasks always belong to a project.',
      inputSchema: z.object({
        name: nameSchema.describe('The project name.'),
        description: z.string().max(500).optional().describe('What the project is about.'),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    ({ name, description }) =>
      run(
        async () =>
          toProjectDto(await projectsService.createProject(userId, { name, description })),
        'Project not found.',
      ),
  );

  server.registerTool(
    'update_project',
    {
      title: 'Update project',
      description:
        'Renames a project, changes its description, or archives or restores it. Archive instead of deleting.',
      inputSchema: z.object({
        id: idSchema('project'),
        name: nameSchema.optional().describe('The new name.'),
        description: z
          .string()
          .max(500)
          .nullable()
          .optional()
          .describe('The new description. null clears it.'),
        archived: z.boolean().optional().describe('true archives the project, false restores it.'),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ id, name, description, archived }) =>
      run(async () => {
        const project = await projectsService.findProject(userId, id);
        if (!project) throw new ToolError('Project not found.');

        const patch = {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(archived !== undefined &&
            Boolean(project.archivedAt) !== archived && {
              archivedAt: archived ? new Date() : null,
            }),
        };

        if (name === undefined && description === undefined && archived === undefined) {
          throw new ToolError('Nothing to update. Pass at least one field to change.');
        }

        return toProjectDto(await projectsService.updateProject(userId, id, patch));
      }, 'Project not found.'),
  );

  server.registerTool(
    'list_tasks',
    {
      title: 'List tasks',
      description:
        'Lists tasks, oldest first. By default only open tasks of active projects. Use due_on for one day, or due_by for everything due up to and including a day, which includes overdue tasks.',
      inputSchema: z.object({
        project_id: idSchema('project').optional().describe('Only tasks of this project.'),
        status: z
          .enum(['incomplete', 'completed', 'all'])
          .optional()
          .describe('Which tasks to list. Defaults to incomplete.'),
        due_on: daySchema.optional().describe('Only tasks due on this day.'),
        due_by: daySchema.optional().describe('Only tasks due on or before this day.'),
        include_archived_projects: z
          .boolean()
          .optional()
          .describe('Also list tasks of archived projects.'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_TASK_LIMIT)
          .optional()
          .describe(`How many tasks to return at most. Defaults to ${DEFAULT_TASK_LIMIT}.`),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({
      project_id,
      status = 'incomplete',
      due_on,
      due_by,
      include_archived_projects,
      limit = DEFAULT_TASK_LIMIT,
    }) =>
      run(async () => {
        if (due_on && due_by) throw new ToolError('Use either due_on or due_by, not both.');

        const [tasks, projectNames] = await Promise.all([
          tasksService.listTasks(userId, timeZone, {
            ...(project_id && { byProject: project_id }),
            ...(due_on && { dueOn: toWallClockDate(due_on) }),
            ...(due_by && { dueBy: toWallClockDate(due_by) }),
            ...(status !== 'all' && { only: status }),
            ...(!include_archived_projects && !project_id && { onlyProject: 'active' as const }),
            // One more than asked for, to know whether there is more.
            take: limit + 1,
          }),
          projectsService.listProjectNames(userId),
        ]);

        return {
          tasks: tasks
            .slice(0, limit)
            .map((task) => toTaskDto(task, timeZone, projectNames.get(task.projectId))),
          has_more: tasks.length > limit,
        };
      }, 'Tasks not found.'),
  );

  server.registerTool(
    'get_task',
    {
      title: 'Get task',
      description: 'Returns one task with all its fields.',
      inputSchema: z.object({ id: idSchema('task') }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ id }) =>
      run(async () => {
        const task = await tasksService.findTask(userId, id);
        if (!task) throw new ToolError('Task not found.');

        return toTaskDto(task, timeZone, task.project.name);
      }, 'Task not found.'),
  );

  server.registerTool(
    'create_task',
    {
      title: 'Create task',
      description: 'Creates a task in a project. Get the project id from list_projects.',
      inputSchema: z.object({
        project_id: idSchema('project the task belongs to'),
        name: nameSchema.describe('The task name.'),
        description: z.string().max(500).optional().describe('More detail about the task.'),
        due_date: daySchema.optional().describe('The day the task is due.'),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    ({ project_id, name, description, due_date }) =>
      run(async () => {
        const task = await tasksService.createTask(userId, {
          projectId: project_id,
          name,
          description,
          dueDate: due_date ? toDueInstant(due_date, timeZone) : null,
        });

        return toTaskDto(task, timeZone, await getProjectName(task.projectId));
      }, 'Project not found.'),
  );

  server.registerTool(
    'update_task',
    {
      title: 'Update task',
      description:
        'Changes a task. Pass only the fields to change. due_date null removes the due date, and project_id moves the task to another project.',
      inputSchema: z.object({
        id: idSchema('task'),
        name: nameSchema.optional().describe('The new name.'),
        description: z
          .string()
          .max(500)
          .nullable()
          .optional()
          .describe('The new description. null clears it.'),
        due_date: daySchema.nullable().optional().describe('The new due day. null removes it.'),
        project_id: idSchema('project to move the task to').optional(),
        completed: z.boolean().optional().describe('true marks the task done, false reopens it.'),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ id, name, description, due_date, project_id, completed }) =>
      run(
        () =>
          changeTask(
            id,
            {
              ...(name !== undefined && { name }),
              ...(description !== undefined && { description }),
              ...(due_date !== undefined && {
                dueDate: due_date === null ? null : toDueInstant(due_date, timeZone),
              }),
              ...(project_id !== undefined && { projectId: project_id }),
            },
            completed,
          ),
        'Task or project not found.',
      ),
  );

  server.registerTool(
    'complete_task',
    {
      title: 'Complete task',
      description: 'Marks a task as done, or reopens it with completed set to false.',
      inputSchema: z.object({
        id: idSchema('task'),
        completed: z.boolean().optional().describe('false reopens the task. Defaults to true.'),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ id, completed = true }) => run(() => changeTask(id, {}, completed), 'Task not found.'),
  );

  server.registerTool(
    'delete_task',
    {
      title: 'Delete task',
      description:
        'Permanently deletes a task. This cannot be undone. Prefer complete_task for tasks that are done.',
      inputSchema: z.object({ id: idSchema('task') }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    ({ id }) =>
      run(async () => {
        const { name } = await tasksService.deleteTask(userId, id);

        return { deleted: true, id, name };
      }, 'Task not found.'),
  );
};
