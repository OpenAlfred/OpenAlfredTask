import { z } from 'zod';
import { stringError } from '@/features/shared/domain/stringError';

/*
 * Nullable fields for easier compatibility with Prisma results.
 */

const idSchema = z
  .string(stringError('The project id is required.', 'The project id must be a string.'))
  .cuid2('The project id must be a valid cuid2 string.');

const nameSchema = z
  .string(stringError('The project name is required.', 'The project name must be a string.'))
  .min(1, 'The project name is required.')
  .max(500, 'The project name must be 500 characters long or shorter.');

export const createProjectSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional().nullable(),
  archivedAt: z
    .literal('')
    .transform(() => undefined)
    .or(z.literal('null').transform(() => null))
    .or(z.coerce.date().optional().nullable()),
});

export const updateProjectSchema = createProjectSchema.extend({
  id: idSchema,
  name: nameSchema.optional().transform((e) => (e === '' ? undefined : e)),
});

export const deleteProjectSchema = z.object({
  id: idSchema,
});
