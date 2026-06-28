import type { DomainEvent } from '@beyondevent/event-bus';
import type { SimulationId, Timestamp, WorkerId } from '@beyondevent/shared';
import type { TraceContext } from '@beyondevent/tracing';

export type { DomainEvent } from '@beyondevent/event-bus';
export type { SimulationId, Timestamp, WorkerId } from '@beyondevent/shared';
export type { TraceContext } from '@beyondevent/tracing';

export interface ScheduledTask {
  readonly id: string;
  readonly executeAt: Timestamp;
  readonly handler: () => Promise<void>;
  readonly retries?: number;
}

export interface DispatchContext {
  readonly traceContext: TraceContext;
  readonly timeoutMs?: number;
}

export interface PipelineContext {
  readonly traceContext: TraceContext;
  readonly simulationId: SimulationId;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export type PipelineMiddlewareFn<TEvent> = (
  event: TEvent,
  ctx: PipelineContext,
  next: () => Promise<void>,
) => Promise<void>;
