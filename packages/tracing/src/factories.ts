import { generateId } from '@beyondevent/shared';
import type { TraceContext } from './interfaces';
import type { CausationId, CorrelationId, SpanId, TraceId } from './types';

export function createTraceId(): TraceId {
  return generateId() as TraceId;
}

export function createSpanId(): SpanId {
  return generateId() as SpanId;
}

export function createCorrelationId(): CorrelationId {
  return generateId() as CorrelationId;
}

export function createTraceContext(parent?: TraceContext): TraceContext {
  return {
    traceId: parent?.traceId ?? createTraceId(),
    spanId: createSpanId(),
    correlationId: parent?.correlationId ?? createCorrelationId(),
    causationId: (parent?.spanId as CausationId | undefined) ?? null,
  };
}
