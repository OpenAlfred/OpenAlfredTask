'use server';

import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { APIError } from 'better-auth/api';
import { getAuth } from '@/features/auth/auth';
import {
  ServerResponse,
  createServerErrorResponse,
} from '@/features/shared/data-access/ServerResponse';
import { genericAwareOfInternalErrorMessage } from '@/features/shared/ui/error/errorMessages';
import { signInSchema, signUpSchema } from '../domain/AuthDomain';

/*
 * The forms call auth.api directly from Server Actions, which skips Better Auth's rate limiter
 * (it sits in front of the HTTP handler). This keeps online password guessing slow: after
 * MAX_FAILED_SIGN_INS wrong passwords for one email, sign-in is blocked for the rest of the window.
 * The counters live in memory, so a restart resets them.
 */
const MAX_FAILED_SIGN_INS = 10;
const FAILED_SIGN_IN_WINDOW_MS = 10 * 60 * 1000;
const failedSignIns = new Map<string, { count: number; resetAt: number }>();

const getFailedSignIns = (email: string) => {
  const now = Date.now();
  const entry = failedSignIns.get(email.toLowerCase());
  return entry && entry.resetAt > now ? entry : undefined;
};

const recordFailedSignIn = (email: string) => {
  const key = email.toLowerCase();
  const now = Date.now();

  // Keep the map small: drop expired entries once it grows.
  if (failedSignIns.size > 1000) {
    failedSignIns.forEach((entry, entryKey) => {
      if (entry.resetAt <= now) failedSignIns.delete(entryKey);
    });
  }

  const entry = getFailedSignIns(email);
  failedSignIns.set(key, {
    count: (entry?.count ?? 0) + 1,
    resetAt: entry?.resetAt ?? now + FAILED_SIGN_IN_WINDOW_MS,
  });
};

/*
 * Better Auth's own messages are safe to show ("Invalid email or password", "Password too
 * short", "User already exists. Use another email.", ...). Anything else is an internal error.
 */
const getErrorMessage = (error: unknown) => {
  if (error instanceof APIError && typeof error.body?.message === 'string') {
    return error.body.message;
  }

  console.error(error);
  return genericAwareOfInternalErrorMessage;
};

export const signInWithEmail = async (
  prevResponse: ServerResponse<undefined> | undefined,
  formData: FormData,
) => {
  const validation = signInSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    // return Zod validation errors.
    return createServerErrorResponse<undefined>(validation.error);
  }

  const { email } = validation.data;

  if ((getFailedSignIns(email)?.count ?? 0) >= MAX_FAILED_SIGN_INS) {
    return createServerErrorResponse<undefined>(
      'Too many failed sign-in attempts. Please try again in a few minutes.',
    );
  }

  try {
    await getAuth().api.signInEmail({ body: validation.data, headers: headers() });
  } catch (error) {
    if (error instanceof APIError && error.status === 'UNAUTHORIZED') recordFailedSignIn(email);

    return createServerErrorResponse<undefined>(getErrorMessage(error));
  }

  failedSignIns.delete(email.toLowerCase());
  redirect('/app/today');
};

export const signUpWithEmail = async (
  prevResponse: ServerResponse<undefined> | undefined,
  formData: FormData,
) => {
  const validation = signUpSchema.safeParse(Object.fromEntries(formData));

  if (!validation.success) {
    // return Zod validation errors.
    return createServerErrorResponse<undefined>(validation.error);
  }

  try {
    const { email, name, password } = validation.data;

    await getAuth().api.signUpEmail({
      body: { email, name: name ?? email.split('@')[0], password },
      headers: headers(),
    });
  } catch (error) {
    return createServerErrorResponse<undefined>(getErrorMessage(error));
  }

  redirect('/app/today');
};
