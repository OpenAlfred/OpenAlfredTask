import { z } from 'zod';

const emailSchema = z
  .string({
    required_error: 'The email is required.',
    invalid_type_error: 'The email must be a string.',
  })
  .trim()
  .email({ message: 'Enter a valid email address.' })
  .max(254, { message: 'The email must be 254 characters long or shorter.' });

const nameSchema = z
  .string({ invalid_type_error: 'The name must be a string.' })
  .trim()
  .max(500, { message: 'The name must be 500 characters long or shorter.' })
  .optional()
  .transform((name) => name || undefined);

export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string({
      required_error: 'The password is required.',
      invalid_type_error: 'The password must be a string.',
    })
    .min(1, { message: 'The password is required.' }),
});

export const signUpSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  password: z
    .string({
      required_error: 'The password is required.',
      invalid_type_error: 'The password must be a string.',
    })
    .min(8, { message: 'The password must be at least 8 characters long.' })
    .max(128, { message: 'The password must be 128 characters long or shorter.' }),
});
