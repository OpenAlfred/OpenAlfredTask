import { z } from 'zod';
import { stringError } from '@/features/shared/domain/stringError';

export const API_TOKEN_EXPIRY_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
  { value: 'never', label: 'No expiry' },
] as const;

export const createApiTokenSchema = z.object({
  name: z
    .string(stringError('The token name is required.', 'The token name must be a string.'))
    .trim()
    .min(1, 'The token name is required.')
    .max(100, 'The token name must be 100 characters long or shorter.'),
  expiresIn: z
    .enum(['30', '90', '365', 'never'], { error: 'Choose when the token expires.' })
    .transform((value) => (value === 'never' ? undefined : Number(value))),
});
