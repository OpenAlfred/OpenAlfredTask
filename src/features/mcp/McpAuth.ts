import 'server-only';
import {
  VerifiedApiToken,
  verifyApiToken,
} from '@/features/app/api-tokens/service/ApiTokensService';

/*
 * The MCP endpoint is for programs, not browsers: they send "Authorization: Bearer <token>" and no
 * Origin header. A browser always sends one, so a request with an Origin that isn't ours is
 * refused. The MCP spec asks for this to stop DNS rebinding attacks against local servers.
 */

const getAllowedOrigins = () => {
  const origins = new Set<string>();
  const urls = [
    process.env.BETTER_AUTH_URL,
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '').split(','),
  ];

  for (const url of urls) {
    try {
      if (url?.trim()) origins.add(new URL(url.trim()).origin);
    } catch {}
  }

  return origins;
};

export const hasDisallowedOrigin = (request: Request) => {
  const origin = request.headers.get('origin');

  return origin !== null && !getAllowedOrigins().has(origin);
};

export const authenticate = async (request: Request): Promise<VerifiedApiToken | null> => {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(\S+)$/i)?.[1];

  return token ? verifyApiToken(token) : null;
};

export const jsonResponse = (status: number, body: object, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

export const unauthorizedResponse = () =>
  jsonResponse(
    401,
    {
      error: 'unauthorized',
      error_description:
        'Send a valid API token as "Authorization: Bearer <token>". You can create one in OpenTask under Settings.',
    },
    { 'WWW-Authenticate': 'Bearer realm="OpenTask"' },
  );
