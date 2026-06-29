import type { EventType } from '@beyondevent/event-bus';
import { generateId } from '@beyondevent/shared';
import type { EventId, SimulationId, Timestamp } from '@beyondevent/shared';
import type { CausationId, CorrelationId, SpanId, TraceId } from '@beyondevent/tracing';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { simulations, topologies } from '../db';
import { getChaosConfig } from './chaos-store';

async function applyChaosThenPublish(
  app: FastifyInstance,
  simulationId: string,
  event: Parameters<typeof app.eventBus.publish>[0],
): Promise<void> {
  const chaos = getChaosConfig(simulationId);

  if (chaos.enabled) {
    if (chaos.latencyMs > 0) {
      await new Promise((r) => setTimeout(r, chaos.latencyMs));
    }
    if (Math.random() < chaos.faultRate) {
      // Emit a fault event instead of the original
      await app.eventBus.publish({
        id: generateId() as EventId,
        type: 'chaos.fault.injected' as EventType,
        payload: { originalType: event.type, message: chaos.errorMessage },
        traceContext: event.traceContext,
        occurredAt: Date.now() as Timestamp,
        version: 1,
        simulationId: event.simulationId,
      });
      return;
    }

    if (chaos.duplicateRate > 0 && Math.random() < chaos.duplicateRate) {
      await app.eventBus.publish(event);
      await app.eventBus.publish({
        ...event,
        id: generateId() as EventId,
        occurredAt: Date.now() as Timestamp,
      });
      return;
    }
  }

  await app.eventBus.publish(event);
}

export function runSimulationTask(app: FastifyInstance, simulationId: string) {
  setTimeout(async () => {
    try {
      const sim = await app.db.query.simulations.findFirst({
        where: eq(simulations.id, simulationId as SimulationId),
      });
      if (sim === undefined || sim.status !== 'running') return;

      if (!sim.topologyId) {
        const traceId = generateId() as TraceId;
        const correlationId = generateId() as CorrelationId;

        const fallbackEvents = [
          { type: 'simulation.started', payload: { message: 'Simulation run started.' } },
          {
            type: 'order.received',
            payload: { orderId: generateId().slice(0, 8), amount: 120 },
          },
          { type: 'payment.processed', payload: { status: 'SUCCESS' } },
          {
            type: 'simulation.finished',
            payload: { message: 'Simulation run completed successfully.' },
          },
        ];

        let i = 0;
        for (const ev of fallbackEvents) {
          const currentSim = await app.db.query.simulations.findFirst({
            where: eq(simulations.id, simulationId as SimulationId),
          });
          if (currentSim === undefined || currentSim.status !== 'running') break;

          const spanId = generateId() as SpanId;
          const causationId = i > 0 ? (generateId() as CausationId) : null;

          await applyChaosThenPublish(app, simulationId, {
            id: generateId() as EventId,
            type: ev.type as EventType,
            payload: ev.payload,
            traceContext: {
              traceId,
              spanId,
              correlationId,
              causationId,
            },
            occurredAt: Date.now() as Timestamp,
            version: 1,
            simulationId: simulationId as SimulationId,
          });

          i++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        await app.db
          .update(simulations)
          .set({ status: 'completed', updatedAt: new Date() })
          .where(eq(simulations.id, simulationId as SimulationId));
        return;
      }

      const topo = await app.db.query.topologies.findFirst({
        where: eq(topologies.id, sim.topologyId),
      });
      if (topo === undefined) return;

      const snap = topo.snapshot as {
        nodes: { id: string; label: string; type: string }[];
        edges: { id: string; source: string; target: string; label?: string }[];
      };
      const nodes = snap.nodes || [];
      const edges = snap.edges || [];

      if (nodes.length === 0) return;

      const traceId = generateId() as TraceId;
      const correlationId = generateId() as CorrelationId;

      const executedEdgeIds = new Set<string>();
      let currentSourceIds = nodes
        .filter((n) => !edges.some((e) => e.target === n.id))
        .map((n) => n.id);
      if (currentSourceIds.length === 0) {
        // biome-ignore lint/style/noNonNullAssertion: checked nodes.length > 0 above
        currentSourceIds = [nodes[0]!.id];
      }

      let lastSpanId: SpanId | null = null;

      while (currentSourceIds.length > 0) {
        const currentSim = await app.db.query.simulations.findFirst({
          where: eq(simulations.id, simulationId as SimulationId),
        });
        if (currentSim === undefined || currentSim.status !== 'running') break;

        const nextEdges = edges.filter(
          (e) => currentSourceIds.includes(e.source) && !executedEdgeIds.has(e.id),
        );
        if (nextEdges.length === 0) break;

        const nextSources: string[] = [];
        for (const edge of nextEdges) {
          executedEdgeIds.add(edge.id);
          nextSources.push(edge.target);

          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);

          const eventType =
            edge.label ||
            `${sourceNode?.label?.toLowerCase().replace(/\s+/g, '.') || 'service'}.event`;
          const payload = {
            source: sourceNode?.label || edge.source,
            target: targetNode?.label || edge.target,
            message: `Event processed from ${sourceNode?.label || 'source'} to ${targetNode?.label || 'target'}`,
          };

          const spanId = generateId() as SpanId;
          const causationId = lastSpanId as CausationId | null;

          await applyChaosThenPublish(app, simulationId, {
            id: generateId() as EventId,
            type: eventType as EventType,
            payload,
            traceContext: {
              traceId,
              spanId,
              correlationId,
              causationId,
            },
            occurredAt: Date.now() as Timestamp,
            version: 1,
            simulationId: simulationId as SimulationId,
          });

          lastSpanId = spanId;
        }

        currentSourceIds = Array.from(new Set(nextSources));
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }

      await app.db
        .update(simulations)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(simulations.id, simulationId as SimulationId));
    } catch (err) {
      app.log.error(err, 'Error running background simulation simulator');
    }
  }, 0);
}
