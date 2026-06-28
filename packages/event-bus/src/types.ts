import type { EventId, SimulationId, Timestamp } from '@beyondevent/shared';
import type { TraceContext } from '@beyondevent/tracing';

export type { EventId, SimulationId, Timestamp } from '@beyondevent/shared';
export type { TraceContext, TraceId } from '@beyondevent/tracing';

export type EventType = string & { readonly __brand: 'EventType' };

export interface DomainEvent<TPayload = unknown> {
  readonly id: EventId;
  readonly type: EventType;
  readonly payload: TPayload;
  readonly traceContext: TraceContext;
  readonly occurredAt: Timestamp;
  readonly version: number;
  readonly simulationId: SimulationId | undefined;
}

export type EventHandler<TPayload> = (event: DomainEvent<TPayload>) => Promise<void>;
export type Unsubscribe = () => void;
