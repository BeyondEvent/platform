import type { DomainEvent, IEventBusAdapter } from '@beyondevent/event-bus';
import type { DbClient } from '../db';
import { events } from '../db';

export function startEventPersister(eventBus: IEventBusAdapter, db: DbClient): () => void {
  return eventBus.subscribeAll(async (event: DomainEvent) => {
    try {
      await db
        .insert(events)
        .values({
          id: event.id,
          type: event.type,
          payload: event.payload as Record<string, unknown>,
          traceId: event.traceContext.traceId,
          spanId: event.traceContext.spanId,
          correlationId: event.traceContext.correlationId,
          causationId: event.traceContext.causationId ?? null,
          simulationId: event.simulationId ?? null,
          version: event.version,
          occurredAt: new Date(event.occurredAt),
        })
        .onConflictDoNothing();
    } catch (err) {
      console.error('[EventPersister] failed to persist event', {
        id: event.id,
        type: event.type,
        err,
      });
    }
  });
}
