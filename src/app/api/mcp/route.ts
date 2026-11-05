import { createMcpHandler } from 'mcp-handler';
import {
  authenticate,
  hasDisallowedOrigin,
  jsonResponse,
  unauthorizedResponse,
} from '@/features/mcp/McpAuth';
import { getInstructions, registerTools } from '@/features/mcp/McpTools';

export const dynamic = 'force-dynamic';

/*
 * The MCP server of OpenAlfred, over Streamable HTTP. It's stateless: every request is
 * authenticated with an API token and gets its own server instance.
 */
export async function POST(request: Request) {
  if (hasDisallowedOrigin(request)) {
    return jsonResponse(403, {
      error: 'forbidden',
      error_description: 'Requests from browsers on other origins are not allowed.',
    });
  }

  const user = await authenticate(request);
  if (!user) return unauthorizedResponse();

  const handle = createMcpHandler((server) => registerTools(server, user), {
    serverInfo: { name: 'openalfred', version: '0.1.0' },
    instructions: getInstructions(user),
  });

  return handle(request);
}

// There are no sessions to stream to or to end.
const methodNotAllowed = () => new Response(null, { status: 405, headers: { Allow: 'POST' } });

export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;
