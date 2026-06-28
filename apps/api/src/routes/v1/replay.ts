import type { DomainEvent, EventType } from '@beyondevent/event-bus';
import type { EventId, SimulationId, Timestamp } from '@beyondevent/shared';
import type { CausationId, CorrelationId, SpanId, TraceId } from '@beyondevent/tracing';
import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { asc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { events, simulations } from '../../db';
import { runSimulationTask } from '../../plugins/simulator';

type EventRow = typeof events.$inferSelect;

function rowToDomainEvent(row: EventRow): DomainEvent {
  return {
    id: row.id as EventId,
    type: row.type as EventType,
    payload: row.payload as unknown,
    traceContext: {
      traceId: row.traceId as TraceId,
      spanId: row.spanId as SpanId,
      correlationId: row.correlationId as CorrelationId,
      causationId: row.causationId !== null ? (row.causationId as CausationId) : null,
    },
    occurredAt: row.occurredAt.getTime() as Timestamp,
    version: row.version,
    simulationId: row.simulationId !== null ? (row.simulationId as SimulationId) : undefined,
  };
}

const ReplayResultSchema = z.object({ replayed: z.number().int() });

export async function replayRoutes(app: FastifyInstance): Promise<void> {
  const a = app.withTypeProvider<ZodTypeProvider>();

  // Replay a single event by ID
  a.post(
    '/event/:eventId',
    {
      schema: {
        tags: ['Replay'],
        params: z.object({ eventId: z.string().uuid() }),
        response: { 200: ReplayResultSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const row = await app.db.query.events.findFirst({
        where: eq(events.id, req.params.eventId),
      });
      if (row === undefined) return reply.status(404).send({ message: 'Event not found' });
      await app.eventBus.publish(rowToDomainEvent(row));
      return { replayed: 1 };
    },
  );

  // Replay all events for a trace ID
  a.post(
    '/trace/:traceId',
    {
      schema: {
        tags: ['Replay'],
        params: z.object({ traceId: z.string() }),
        response: { 200: ReplayResultSchema },
      },
    },
    async (req) => {
      const rows = await app.db
        .select()
        .from(events)
        .where(eq(events.traceId, req.params.traceId))
        .orderBy(asc(events.occurredAt));

      for (const row of rows) {
        await app.eventBus.publish(rowToDomainEvent(row));
      }
      return { replayed: rows.length };
    },
  );

  /**
   * Replay an entire simulation by re-running the simulator from scratch.
   * Resets status to pending → running, which triggers runSimulationTask
   * exactly like a fresh run — generating new trace IDs and respecting any
   * topology changes made since the original run.
   */
  a.post(
    '/simulation/:simulationId',
    {
      schema: {
        tags: ['Replay'],
        params: z.object({ simulationId: z.string().uuid() }),
        body: z.object({}).default({}),
        response: { 200: ReplayResultSchema, 404: z.object({ message: z.string() }) },
      },
    },
    async (req, reply) => {
      const sim = await app.db.query.simulations.findFirst({
        where: eq(simulations.id, req.params.simulationId as SimulationId),
      });
      if (sim === undefined) return reply.status(404).send({ message: 'Simulation not found' });

      // Reset to pending first
      await app.db
        .update(simulations)
        .set({ status: 'pending', updatedAt: new Date() })
        .where(eq(simulations.id, req.params.simulationId as SimulationId));

      // Set to running — this is what triggers the background simulator task
      await app.db
        .update(simulations)
        .set({ status: 'running', updatedAt: new Date() })
        .where(eq(simulations.id, req.params.simulationId as SimulationId));

      runSimulationTask(app, req.params.simulationId);

      return { replayed: 1 };
    },
  );
}
