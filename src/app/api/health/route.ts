import { prisma } from '@/features/shared/data-access/prisma';

export const dynamic = 'force-dynamic';

/*
 * Used by the Docker healthcheck: answers 200 only when the database is reachable.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return Response.json({ status: 'error' }, { status: 503 });
  }
}
