import type { EventType, IEventBus } from '@beyondevent/event-bus';
import type { IMetricsRegistry } from '@beyondevent/metrics';
import type { SemVer, WorkerId } from '@beyondevent/shared';
import type { ITracer, TraceContext } from '@beyondevent/tracing';
import type { WorkerLifecycleState } from './types';

export type { EventType, IEventBus } from '@beyondevent/event-bus';
export type { IMetricsRegistry } from '@beyondevent/metrics';
export type { SemVer, WorkerId } from '@beyondevent/shared';
export type { ITracer, TraceContext } from '@beyondevent/tracing';
export type { WorkerLifecycleState } from './types';

export interface WorkerMetadata {
  readonly id: WorkerId;
  readonly name: string;
  readonly version: SemVer;
  readonly description: string;
  readonly tags: string[];
}

export interface WorkerContext {
  readonly traceContext: TraceContext;
  readonly eventBus: IEventBus;
  readonly tracer: ITracer;
  readonly metrics: IMetricsRegistry;
  log(level: 'debug' | 'info' | 'warn' | 'error', msg: string, data?: unknown): void;
}

export interface WorkerDefinition<TInput = unknown, TOutput = unknown> {
  readonly metadata: WorkerMetadata;
  execute(input: TInput, context: WorkerContext): Promise<TOutput>;
}

export interface WorkerRunOptions {
  readonly eventBus: IEventBus;
  readonly tracer: ITracer;
  readonly metrics: IMetricsRegistry;
  readonly subscribeTo: EventType[];
  readonly maxRetries?: number;
  readonly timeoutMs?: number;
}

export interface WorkerHandle<TInput = unknown, TOutput = unknown> {
  readonly definition: WorkerDefinition<TInput, TOutput>;
  readonly state: WorkerLifecycleState;
  stop(): Promise<void>;
}
