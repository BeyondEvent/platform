import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { events } from '../../db';

const EventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  payload: z.unknown(),
  traceId: z.string(),
  spanId: z.string(),
  correlationId: z.string(),
  causationId: z.string().nullable(),
  simulationId: z.string().uuid().nullable(),
  version: z.number().int(),
  occurredAt: z.string(),
  createdAt: z.string(),
});

type EventRow = typeof events.$inferSelect;

const toResponse = (row: EventRow) => ({
  id: row.id,
  type: row.type,
  payload: row.payload,
  traceId: row.traceId,
  spanId: row.spanId,
  correlationId: row.correlationId,
  causationId: row.causationId,
  simulationId: row.simulationId,
  version: row.version,
  occurredAt: row.occurredAt.toISOString(),
  createdAt: row.createdAt.toISOString(),
});

import { decodeCursor, encodeCursor, getCursorCondition } from '../../utils/pagination';

export async function eventRoutes(app: FastifyInstance): Promise<void> {
  const a = app.withTypeProvider<ZodTypeProvider>();

  a.get(
    '/',
    {
      schema: {
        tags: ['Events'],
        querystring: z.object({
          traceId: z.string().optional(),
          correlationId: z.string().optional(),
          type: z.string().optional(),
          from: z.string().datetime().optional(),
          to: z.string().datetime().optional(),
          limit: z.coerce.number().int().min(1).max(500).default(100),
          order: z.enum(['asc', 'desc']).default('desc'),
          cursor: z.string().optional(),
          simulationId: z.string().uuid().optional(),
        }),
        response: { 200: z.array(EventSchema) },
      },
    },
    async (req, reply) => {
      const { traceId, correlationId, type, from, to, limit, order, cursor, simulationId } =
        req.query;

      let cursorCondition: ReturnType<typeof getCursorCondition> | undefined;
      if (cursor !== undefined) {
        const decoded = decodeCursor(cursor);
        if (decoded !== null) {
          cursorCondition = getCursorCondition(events.occurredAt, events.id, decoded, order);
        }
      }

      const rows = await app.db
        .select()
        .from(events)
        .where(
          and(
            traceId !== undefined ? eq(events.traceId, traceId) : undefined,
            correlationId !== undefined ? eq(events.correlationId, correlationId) : undefined,
            type !== undefined ? eq(events.type, type) : undefined,
            from !== undefined ? gte(events.occurredAt, new Date(from)) : undefined,
            to !== undefined ? lte(events.occurredAt, new Date(to)) : undefined,
            simulationId !== undefined ? eq(events.simulationId, simulationId) : undefined,
            cursorCondition,
          ),
        )
        .orderBy(order === 'asc' ? asc(events.occurredAt) : desc(events.occurredAt))
        .limit(limit);

      if (rows.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: checked rows.length > 0 above
        const lastRow = rows[rows.length - 1]!;
        const nextCursor = encodeCursor(lastRow.occurredAt, lastRow.id);
        reply.header('X-Next-Cursor', nextCursor);
        reply.header('Access-Control-Expose-Headers', 'X-Next-Cursor');
      }

      return rows.map(toResponse);
    },
  );

  a.get(
    '/:id',
    {
      schema: {
        tags: ['Events'],
        params: z.object({ id: z.string().uuid() }),
        response: { 200: EventSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const row = await app.db.query.events.findFirst({
        where: eq(events.id, req.params.id),
      });
      if (row === undefined) return reply.status(404).send({ message: 'Event not found' });
      return toResponse(row);
    },
  );
}
