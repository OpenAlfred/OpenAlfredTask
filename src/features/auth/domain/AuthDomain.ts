import { z } from 'zod';
import { stringError } from '@/features/shared/domain/stringError';

const emailSchema = z
  .string(stringError('The email is required.', 'The email must be a string.'))
  .trim()
  .email('Enter a valid email address.')
  .max(254, 'The email must be 254 characters long or shorter.');

const nameSchema = z
  .string({ error: 'The name must be a string.' })
  .trim()
  .max(500, 'The name must be 500 characters long or shorter.')
  .optional()
  .transform((name) => name || undefined);

export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string(stringError('The password is required.', 'The password must be a string.'))
    .min(1, 'The password is required.'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: z
    .string(stringError('The password is required.', 'The password must be a string.'))
    .min(8, 'The password must be at least 8 characters long.')
    .max(128, 'The password must be 128 characters long or shorter.'),
});
