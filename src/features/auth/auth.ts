import 'server-only';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from '@/features/shared/data-access/prisma';

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

/*
 * Set DISABLE_SIGNUP=true once your own account exists to close registration.
 */
export const isSignUpEnabled = () => process.env.DISABLE_SIGNUP !== 'true';

const createAuth = () =>
  betterAuth({
    /*
     * BETTER_AUTH_URL (the public URL of the app) and BETTER_AUTH_SECRET (32+ characters, for
     * example from `openssl rand -base64 32`) are read from the environment.
     */
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: { enabled: true, disableSignUp: !isSignUpEnabled() },
    session: { expiresIn: THIRTY_DAYS_IN_SECONDS },
    user: {
      additionalFields: { timeZone: { type: 'string', required: false, input: false } },
    },
    /*
     * The id columns are UUIDs without a database default. With the "uuid" option Better Auth
     * leaves the generation to PostgreSQL, so it has to be a function to generate them itself.
     */
    advanced: { database: { generateId: () => crypto.randomUUID() } },
    // The origin of BETTER_AUTH_URL is always trusted. Add more as a comma-separated list.
    trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    // nextCookies() must be the last plugin: it lets Server Actions set the session cookie.
    plugins: [nextCookies()],
  });

let auth: ReturnType<typeof createAuth> | undefined;

/*
 * Created on first use instead of at import time, so `next build` doesn't need the secret.
 */
export const getAuth = () => (auth ??= createAuth());
