# @beyondevent/worker-sdk

SDK for defining BeyondEvent workers.

## Exports

- **Types**: `WorkerMetadata`, `WorkerContext`, `WorkerDefinition<TInput, TOutput>`, `WorkerLifecycleState`
- **Factory**: `createWorker<TInput, TOutput>(definition)` — returns the definition (identity), ensures type inference

## Worker Lifecycle

Subscribe → Receive → Validate → Execute → Publish → Ack

## WorkerContext

Workers receive `eventBus`, `tracer`, `metrics`, and `log` — everything needed to observe and communicate, nothing that couples to infrastructure.

Workers never communicate directly. All communication goes through `eventBus.publish()`.
