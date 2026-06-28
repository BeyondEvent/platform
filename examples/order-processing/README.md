# Order Processing Example

Demonstrates the BeyondEvent worker SDK with a simple order processing flow.

## Event Flow

```
OrderPlaced → OrderProcessor → OrderAccepted / OrderRejected
                             → InventoryReserved
                             → PaymentRequested
```

## Workers

- `order-processor` — validates and accepts orders, publishes `order.received`

## Phase 2+

Full implementation with Redis Streams transport, real event flow, and dashboard visualization.
