import { createTopologyGraph } from '@beyondevent/topology';
import type { EdgeId, NodeId } from '@beyondevent/topology';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { topologies } from '../../db';

const TopologyNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const TopologyEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

const TopologySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  snapshot: z.object({
    nodes: z.array(z.unknown()),
    edges: z.array(z.unknown()),
  }),
  createdAt: z.string(),
});

type TopologyRow = typeof topologies.$inferSelect;

const toResponse = (row: TopologyRow) => ({
  id: row.id,
  name: row.name,
  snapshot: row.snapshot as { nodes: unknown[]; edges: unknown[] },
  createdAt: row.createdAt.toISOString(),
});

export async function topologyRoutes(app: FastifyInstance): Promise<void> {
  const a = app.withTypeProvider<ZodTypeProvider>();

  a.get(
    '/',
    {
      schema: {
        tags: ['Topologies'],
        querystring: z.object({
          search: z.string().optional(),
        }),
        response: { 200: z.array(TopologySchema) },
      },
    },
    async (req) => {
      const { search } = req.query;
      const rows = await app.db.query.topologies.findMany({
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
        tags: ['Topologies'],
        params: z.object({ id: z.uuid() }),
        response: {
          200: TopologySchema,
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (req, reply) => {
      const row = await app.db.query.topologies.findFirst({
        where: eq(topologies.id, req.params.id),
      });
      if (row === undefined) return reply.status(404).send({ message: 'Topology not found' });
      return toResponse(row);
    },
  );

  a.post(
    '/',
    {
      schema: {
        tags: ['Topologies'],
        body: z.object({
          name: z.string().min(1),
          nodes: z.array(TopologyNodeSchema).default([]),
          edges: z.array(TopologyEdgeSchema).default([]),
        }),
        response: {
          201: TopologySchema,
          422: z.object({ errors: z.array(z.string()) }),
        },
      },
    },
    async (req, reply) => {
      const graph = createTopologyGraph();
      for (const n of req.body.nodes) {
        graph.addNode({ ...n, id: n.id as NodeId });
      }
      for (const e of req.body.edges) {
        graph.addEdge({
          id: e.id as EdgeId,
          source: e.source as NodeId,
          target: e.target as NodeId,
          ...(e.label !== undefined ? { label: e.label } : {}),
        });
      }
      const validation = graph.validate();
      if (!validation.valid) return reply.status(422).send({ errors: validation.errors });
      const snapshot = graph.toJSON();
      const [row] = await app.db
        .insert(topologies)
        .values({ name: req.body.name, snapshot })
        .returning();
      if (row === undefined) throw new Error('Insert returned no rows');
      return reply.status(201).send(toResponse(row));
    },
  );

  a.patch(
    '/:id',
    {
      schema: {
        tags: ['Topologies'],
        params: z.object({ id: z.uuid() }),
        body: z.object({
          name: z.string().min(1).optional(),
          nodes: z.array(TopologyNodeSchema).optional(),
          edges: z.array(TopologyEdgeSchema).optional(),
        }),
        response: {
          200: TopologySchema,
          404: z.object({ message: z.string() }),
          422: z.object({ errors: z.array(z.string()) }),
        },
      },
    },
    async (req, reply) => {
      const existing = await app.db.query.topologies.findFirst({
        where: eq(topologies.id, req.params.id),
      });
      if (existing === undefined) return reply.status(404).send({ message: 'Topology not found' });

      const name = req.body.name ?? existing.name;
      let snapshot = existing.snapshot as { nodes: unknown[]; edges: unknown[] };

      if (req.body.nodes !== undefined || req.body.edges !== undefined) {
        const graph = createTopologyGraph();
        const nodes = (req.body.nodes ?? snapshot.nodes) as {
          id: string;
          label: string;
          type: string;
          metadata: Record<string, unknown>;
        }[];
        const edges = (req.body.edges ?? snapshot.edges) as {
          id: string;
          source: string;
          target: string;
          label?: string;
        }[];

        for (const n of nodes) {
          graph.addNode({ ...n, id: n.id as NodeId });
        }
        for (const e of edges) {
          graph.addEdge({
            id: e.id as EdgeId,
            source: e.source as NodeId,
            target: e.target as NodeId,
            ...(e.label !== undefined ? { label: e.label } : {}),
          });
        }
        const validation = graph.validate();
        if (!validation.valid) return reply.status(422).send({ errors: validation.errors });
        snapshot = graph.toJSON();
      }

      const [row] = await app.db
        .update(topologies)
        .set({ name, snapshot, updatedAt: new Date() })
        .where(eq(topologies.id, req.params.id))
        .returning();

      if (row === undefined) return reply.status(404).send({ message: 'Topology not found' });
      return reply.send(toResponse(row));
    },
  );

  a.delete(
    '/:id',
    {
      schema: {
        tags: ['Topologies'],
        params: z.object({ id: z.uuid() }),
        response: { 204: z.null() },
      },
    },
    async (req, reply) => {
      await app.db.delete(topologies).where(eq(topologies.id, req.params.id));
      return reply.status(204).send(null);
    },
  );
}
