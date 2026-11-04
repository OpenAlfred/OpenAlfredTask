import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cuid2 } from '@/features/shared/data-access/cuid2';
import { prisma } from '@/features/shared/data-access/prisma';

/*
 * Personal access tokens for the MCP server. A token is "otk_" followed by 32 random bytes in
 * base64url. Only its SHA-256 hash is stored. The token is random enough that a plain hash can't
 * be guessed or brute-forced, and it lets us look a token up with one indexed query.
 */

const TOKEN_PREFIX = 'otk_';
const MAX_TOKEN_LENGTH = 128;
const LAST_USED_REFRESH_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const MAX_TOKENS_PER_USER = 20;

export class ApiTokenLimitError extends Error {
  constructor() {
    super(`You can have at most ${MAX_TOKENS_PER_USER} API tokens. Revoke one first.`);
  }
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const listApiTokens = (userId: string) =>
  prisma.apiToken.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      prefix: true,
      createdAt: true,
      lastUsedAt: true,
      expiresAt: true,
    },
  });

/*
 * Returns the token. This is the only time it exists in plain text.
 */
export const createApiToken = async (
  userId: string,
  { name, expiresInDays }: { name: string; expiresInDays?: number },
) => {
  if ((await prisma.apiToken.count({ where: { userId } })) >= MAX_TOKENS_PER_USER) {
    throw new ApiTokenLimitError();
  }

  const token = `${TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;

  await prisma.apiToken.create({
    data: {
      id: cuid2(),
      name,
      prefix: token.slice(0, 12),
      tokenHash: hashToken(token),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * DAY_MS) : null,
      userId,
    },
  });

  return token;
};

export const revokeApiToken = (userId: string, id: string) =>
  prisma.apiToken.deleteMany({ where: { id, userId } });

export interface VerifiedApiToken {
  readonly userId: string;
  readonly timeZone: string;
}

/*
 * Returns the owner of a valid, unexpired token, or null.
 */
export const verifyApiToken = async (token: string): Promise<VerifiedApiToken | null> => {
  if (!token.startsWith(TOKEN_PREFIX) || token.length > MAX_TOKEN_LENGTH) return null;

  const record = await prisma.apiToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      lastUsedAt: true,
      user: { select: { timeZone: true } },
    },
  });

  if (!record) return null;

  const now = Date.now();
  if (record.expiresAt && record.expiresAt.getTime() <= now) return null;

  // Keep "last used" fresh without a write on every request.
  if (!record.lastUsedAt || now - record.lastUsedAt.getTime() > LAST_USED_REFRESH_MS) {
    prisma.apiToken
      .update({ where: { id: record.id }, data: { lastUsedAt: new Date(now) } })
      .catch((error) => console.error(error));
  }

  return { userId: record.userId, timeZone: record.user.timeZone ?? '' };
};
