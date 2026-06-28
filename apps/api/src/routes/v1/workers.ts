import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { workers } from '../../db';

const WorkerSchema = z.object({
  id: z.uuid(),
  workerId: z.string(),
  name: z.string(),
  version: z.string(),
  state: z.enum([
    'idle',
    'subscribing',
    'receiving',
    'validating',
    'executing',
    'publishing',
    'acking',
    'error',
  ]),
  tags: z.array(z.string()),
  createdAt: z.date().transform((s) => new Date(s).toISOString()),
});

type WorkerRow = typeof workers.$inferSelect;

const toResponse = (row: WorkerRow) => ({
  id: row.id,
  workerId: row.workerId,
  name: row.name,
  version: row.version,
  state: row.state,
  tags: row.tags,
  createdAt: row.createdAt.toISOString(),
});

export async function workerRoutes(app: FastifyInstance): Promise<void> {
  const a = app.withTypeProvider<ZodTypeProvider>();

  a.get(
    '/',
    {
      schema: {
        tags: ['Workers'],
        querystring: z.object({ simulationId: z.uuid().optional() }),
        response: { 200: z.array(WorkerSchema) },
      },
    },
    async () => {
      const rows = await app.db.query.workers.findMany({
        orderBy: (t, { asc }) => [asc(t.name)],
      });
      return rows.map(toResponse);
    },
  );

  a.get(
    '/:id',
    {
      schema: {
        tags: ['Workers'],
        params: z.object({ id: z.uuid() }),
        response: {
          200: WorkerSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      const row = await app.db.query.workers.findFirst({
        where: eq(workers.id, req.params.id),
      });
      if (row === undefined) return reply.status(404).send({ message: 'Worker not found' });
      return toResponse(row);
    },
  );
}
