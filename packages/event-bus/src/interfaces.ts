import type { EventId, SimulationId, Timestamp } from '@beyondevent/shared';
import type { TraceId } from '@beyondevent/tracing';
import type { DomainEvent, EventHandler, EventType, Unsubscribe } from './types';

export interface IEventBus {
  publish<TPayload>(event: DomainEvent<TPayload>): Promise<void>;
  subscribe<TPayload>(type: EventType, handler: EventHandler<TPayload>): Unsubscribe;
  subscribeMany<TPayload>(types: EventType[], handler: EventHandler<TPayload>): Unsubscribe;
}

export interface IReplayable {
  replayEvent(eventId: EventId): Promise<void>;
  replayTrace(traceId: TraceId): Promise<void>;
  replaySimulation(simulationId: SimulationId, from?: Timestamp, to?: Timestamp): Promise<void>;
}

export interface IEventBusAdapter extends IEventBus {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  readonly isConnected: boolean;
  /** Catch-all subscription — fires for every published event regardless of type. */
  subscribeAll(handler: EventHandler<unknown>): Unsubscribe;
}

export interface IReplayableEventBusAdapter extends IEventBusAdapter, IReplayable {}
