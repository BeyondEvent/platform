# @beyondevent/runtime

Core execution engine for BeyondEvent. Interfaces only — no Redis, no HTTP.

## Exports

- **Interfaces**: `ILifecycle`, `IScheduler`, `IDispatcher`, `IPipeline`, `IPipelineMiddleware`
- **Types**: `ScheduledTask`, `DispatchContext`, `PipelineContext`, `PipelineMiddlewareFn`
- **Middleware factories**: `createValidationMiddleware()`, `createTracingMiddleware()`, `createMetricsMiddleware()`, `createChaosMiddleware()` (no-op stubs until Phase 2/6)

## Pipeline

Execution order: Validation → Tracing → Metrics → Chaos → Worker → Publish → Persist

## Architecture

Runtime must not depend on Redis or HTTP. Transport and framework are injected via interfaces.
