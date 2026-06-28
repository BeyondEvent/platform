# @beyondevent/tracing

Distributed tracing primitives for BeyondEvent. No OpenTelemetry dependency.

## Exports

- **Types**: `TraceId`, `SpanId`, `CorrelationId`, `CausationId` (branded strings), `TraceContext`
- **Interfaces**: `ITracer`
- **Factories**: `createTraceId()`, `createSpanId()`, `createCorrelationId()`, `createTraceContext()`

Every event in the system carries a `TraceContext` for full observability across workers.
