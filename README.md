# BeyondEvent

> Making Event-Driven Systems Observable, Understandable, and Interactive.

BeyondEvent is an open-source platform for designing, executing, observing, debugging, and teaching event-driven systems.

## Monorepo Structure

```
apps/
  api/          Fastify control plane (REST + WebSocket)
  dashboard/    React visual interface
  docs/         Documentation site

packages/
  shared/       Branded types, errors, utilities
  tracing/      TraceId, SpanId, CorrelationId, CausationId
  metrics/      Counter, Gauge, Histogram, Timer interfaces
  topology/     Directed graph (nodes, edges, validation, traversal)
  event-bus/    Transport abstraction (IEventBus, IReplayable)
  runtime/      Execution engine (pipeline, scheduler, dispatcher, lifecycle)
  worker-sdk/   createWorker(), WorkerContext, WorkerDefinition
  ui/           Shared React components

examples/
  order-processing/
  flash-sale/
  payment-failure/
```

## Getting Started

```sh
# Prerequisites: Node.js 24+, pnpm 9+, Docker

pnpm install
docker compose up -d
cp .env.example .env

pnpm build
pnpm dev
```

- API: http://localhost:3000
- Dashboard: http://localhost:5173

## Roadmap

| Phase | Scope |
|-------|-------|
| 1 | Bootstrap (current) |
| 2 | Runtime implementation |
| 3 | Event Bus (Redis Streams) |
| 4 | Dashboard (React Flow canvas) |
| 5 | Replay |
| 6 | Chaos Engineering |
| 7 | Multi-broker support |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
