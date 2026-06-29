import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { simulations } from '../../db';
import { runSimulationTask } from '../../plugins/simulator';

const SimulationSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  status: z.enum(['pending', 'running', 'paused', 'completed', 'failed']),
  topologyId: z.uuid().nullable(),
  createdAt: z.string(),
});

type SimulationRow = typeof simulations.$inferSelect;

const toResponse = (row: SimulationRow) => ({
  id: row.id,
  name: row.name,
  status: row.status,
  topologyId: row.topologyId,
  createdAt: row.createdAt.toISOString(),
});

export async function simulationRoutes(app: FastifyInstance): Promise<void> {
  const a = app.withTypeProvider<ZodTypeProvider>();

  a.get(
    '/',
    {
      schema: {
        tags: ['Simulations'],
        querystring: z.object({
          search: z.string().optional(),
        }),
        response: { 200: z.array(SimulationSchema) },
      },
    },
    async (req) => {
      const { search } = req.query;
      const rows = await app.db.query.simulations.findMany({
        where: search ? (t, { ilike }) => ilike(t.name, `%${search}%`) : undefined,
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      });
      return rows.map(toResponse);
    },
  );

  a.get(
    '/:id',
    {
      schema: {
        tags: ['Simulations'],
        params: z.object({ id: z.uuid() }),
        response: {
          200: SimulationSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      const row = await app.db.query.simulations.findFirst({
        where: eq(simulations.id, req.params.id),
      });
      if (row === undefined) return reply.status(404).send({ message: 'Simulation not found' });
      return toResponse(row);
    },
  );

  a.post(
    '/',
    {
      schema: {
        tags: ['Simulations'],
        body: z.object({
          name: z.string().min(1),
          topologyId: z.uuid().optional(),
        }),
        response: { 201: SimulationSchema },
      },
    },
    async (req, reply) => {
      const [row] = await app.db
        .insert(simulations)
        .values({
          name: req.body.name,
          topologyId: req.body.topologyId ?? null,
          status: 'pending',
        })
        .returning();
      if (row === undefined) throw new Error('Insert returned no rows');
      return reply.status(201).send(toResponse(row));
    },
  );

  a.patch(
    '/:id/status',
    {
      schema: {
        tags: ['Simulations'],
        params: z.object({ id: z.uuid() }),
        body: z.object({
          status: z.enum(['pending', 'running', 'paused', 'completed', 'failed']),
        }),
        response: {
          200: SimulationSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      const [row] = await app.db
        .update(simulations)
        .set({ status: req.body.status, updatedAt: new Date() })
        .where(eq(simulations.id, req.params.id))
        .returning();
      if (row === undefined) return reply.status(404).send({ message: 'Simulation not found' });

      if (req.body.status === 'running') {
        runSimulationTask(app, req.params.id);
      }

      return toResponse(row);
    },
  );

  a.patch(
    '/:id',
    {
      schema: {
        tags: ['Simulations'],
        params: z.object({ id: z.uuid() }),
        body: z.object({
          name: z.string().min(1).optional(),
          topologyId: z.uuid().nullable().optional(),
        }),
        response: {
          200: SimulationSchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      const { name, topologyId } = req.body;
      const [row] = await app.db
        .update(simulations)
        .set({
          ...(name !== undefined ? { name } : {}),
          ...(topologyId !== undefined ? { topologyId } : {}),
          updatedAt: new Date(),
        })
        .where(eq(simulations.id, req.params.id))
        .returning();
      if (row === undefined) return reply.status(404).send({ message: 'Simulation not found' });
      return toResponse(row);
    },
  );

  a.delete(
    '/:id',
    {
      schema: {
        tags: ['Simulations'],
        params: z.object({ id: z.uuid() }),
        response: { 204: z.null() },
      },
    },
    async (req, reply) => {
      await app.db.delete(simulations).where(eq(simulations.id, req.params.id));
      return reply.status(204).send(null);
    },
  );
}
