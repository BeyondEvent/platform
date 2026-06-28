import type { CausationId, CorrelationId, SpanId, TraceId } from './types';

export interface TraceContext {
  readonly traceId: TraceId;
  readonly spanId: SpanId;
  readonly correlationId: CorrelationId;
  readonly causationId: CausationId | null;
}

export interface ITracer {
  startSpan(name: string, parent?: TraceContext): TraceContext;
  endSpan(ctx: TraceContext): void;
}
