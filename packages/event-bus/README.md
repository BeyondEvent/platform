# @beyondevent/event-bus

Transport abstraction for BeyondEvent. Defines publish/subscribe contracts only.

## Exports

- **Types**: `EventType`, `DomainEvent<TPayload>`, `EventHandler`, `Unsubscribe`
- **Interfaces**: `IEventBus`, `IReplayable`, `IEventBusAdapter`, `IReplayableEventBusAdapter`

## Adapters

- `src/adapters/redis-streams/` — Phase 3 implementation (Redis consumer groups + replay)
- Future: Kafka, RabbitMQ, NATS

## Architecture

The event bus never knows how workers execute. Workers never communicate directly — only through events.
