import type { EventId, SimulationId, Timestamp } from '@beyondevent/shared';
import type { TraceId } from '@beyondevent/tracing';
import type { IReplayableEventBusAdapter } from '../interfaces';
import type { DomainEvent, EventHandler, EventType, Unsubscribe } from '../types';

type AnyHandler = EventHandler<unknown>;

class InMemoryEventBusAdapterImpl implements IReplayableEventBusAdapter {
  private readonly handlers = new Map<EventType, Set<AnyHandler>>();
  private readonly globalHandlers = new Set<AnyHandler>();
  private readonly store: DomainEvent[] = [];
  private connected = false;

  get isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.handlers.clear();
    this.globalHandlers.clear();
  }

  subscribeAll(handler: AnyHandler): Unsubscribe {
    this.globalHandlers.add(handler);
    return () => this.globalHandlers.delete(handler);
  }

  async publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
    this.store.push(event as DomainEvent);
    await this.dispatch(event as DomainEvent);
  }

  subscribe<TPayload>(type: EventType, handler: EventHandler<TPayload>): Unsubscribe {
    let set = this.handlers.get(type);
    if (set === undefined) {
      set = new Set<AnyHandler>();
      this.handlers.set(type, set);
    }
    set.add(handler as AnyHandler);
    return () => set.delete(handler as AnyHandler);
  }

  subscribeMany<TPayload>(types: EventType[], handler: EventHandler<TPayload>): Unsubscribe {
    const unsubs = types.map((t) => this.subscribe(t, handler));
    return () => {
      for (const u of unsubs) u();
    };
  }

  async replayEvent(eventId: EventId): Promise<void> {
    const event = this.store.find((e) => e.id === eventId);
    if (event !== undefined) await this.dispatch(event);
  }

  async replayTrace(traceId: TraceId): Promise<void> {
    const events = this.store
      .filter((e) => e.traceContext.traceId === traceId)
      .sort((a, b) => a.occurredAt - b.occurredAt);
    for (const event of events) await this.dispatch(event);
  }

  async replaySimulation(
    _simulationId: SimulationId,
    from?: Timestamp,
    to?: Timestamp,
  ): Promise<void> {
    // ponytail: DomainEvent has no simulationId field — filter by time range only.
    // Redis adapter (Phase 3) uses stream keys that encode simulationId so this is correct there.
    const events = this.store
      .filter((e) => {
        if (from !== undefined && e.occurredAt < from) return false;
        if (to !== undefined && e.occurredAt > to) return false;
        return true;
      })
      .sort((a, b) => a.occurredAt - b.occurredAt);
    for (const event of events) await this.dispatch(event);
  }

  private async dispatch(event: DomainEvent): Promise<void> {
    // Snapshot before iterating — safe when a handler calls unsubscribe mid-dispatch.
    const typed = this.handlers.get(event.type);
    const all = [...(typed ?? []), ...this.globalHandlers];
    for (const handler of all) {
      try {
        await handler(event);
      } catch (err) {
        // Swallow per-handler errors so one bad handler never silences the others.
        console.error(`[InMemoryEventBus] handler threw for type="${event.type}"`, err);
      }
    }
  }
}

export function createInMemoryEventBus(): IReplayableEventBusAdapter {
  return new InMemoryEventBusAdapterImpl();
}
