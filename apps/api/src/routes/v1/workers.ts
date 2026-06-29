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
  createdAt: z.string(),
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

  a.post(
    '/',
    {
      schema: {
        tags: ['Workers'],
        body: z.object({
          workerId: z.string().min(1),
          name: z.string().min(1),
          version: z.string().min(1),
          tags: z.array(z.string()).default([]),
        }),
        response: { 201: WorkerSchema },
      },
    },
    async (req, reply) => {
      const [row] = await app.db
        .insert(workers)
        .values({
          workerId: req.body.workerId,
          name: req.body.name,
          version: req.body.version,
          tags: req.body.tags,
          state: 'idle',
        })
        .onConflictDoUpdate({
          target: workers.workerId,
          set: {
            name: req.body.name,
            version: req.body.version,
            tags: req.body.tags,
            state: 'idle',
            updatedAt: new Date(),
          },
        })
        .returning();
      if (row === undefined) throw new Error('Insert returned no rows');
      return reply.status(201).send(toResponse(row));
    },
  );

  a.patch(
    '/:id/state',
    {
      schema: {
        tags: ['Workers'],
        params: z.object({ id: z.uuid() }),
        body: z.object({
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
        }),
        response: { 200: WorkerSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const [row] = await app.db
        .update(workers)
        .set({ state: req.body.state, updatedAt: new Date() })
        .where(eq(workers.id, req.params.id))
        .returning();
      if (row === undefined) return reply.status(404).send({ message: 'Worker not found' });
      return toResponse(row);
    },
  );

  a.delete(
    '/:id',
    {
      schema: {
        tags: ['Workers'],
        params: z.object({ id: z.uuid() }),
        response: { 204: z.null() },
      },
    },
    async (req, reply) => {
      await app.db.delete(workers).where(eq(workers.id, req.params.id));
      return reply.status(204).send(null);
    },
  );
}
