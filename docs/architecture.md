# BeyondEvent Architecture

> **Goal**: Make event-driven systems observable, understandable, and interactive.
> Not just a message queue wrapper — a platform where you can *see* events flow, *replay* what happened, *inject* failures, and *debug* distributed systems visually.

---

## The Big Picture

A user designs a topology (which services talk to which), runs a simulation, and watches events propagate in real time on the dashboard. Behind the scenes:

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Dashboard  (React + React Flow + TanStack Router)   │   │
│  │  • Drag-and-drop topology editor                     │   │
│  │  • Real-time event timeline                          │   │
│  │  • Metrics panels, trace explorer                    │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────│─────────────────────────────────────┘
                        │ REST + WebSocket
┌───────────────────────▼─────────────────────────────────────┐
│                       API  (Fastify)                         │
│  • Control plane: create simulations, manage topologies      │
│  • WebSocket gateway: streams live updates to dashboard      │
│  • Reads/writes Postgres via Drizzle ORM                     │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
    bootstraps                   persists to
           │                          │
┌──────────▼──────────┐    ┌──────────▼──────────┐
│      RUNTIME         │    │      POSTGRES         │
│  • Lifecycle mgmt    │    │  events, traces,      │
│  • Execution pipeline│    │  simulations,         │
│  • Scheduler         │    │  topologies,          │
│  • Dispatcher        │    │  workers, snapshots   │
└──────────┬──────────┘    └─────────────────────┘
           │ dispatches events
┌──────────▼──────────┐
│      EVENT BUS       │
│  • Publish/Subscribe │
│  • Replay            │
│  Phase 1: in-memory  │
│  Phase 3: Redis      │
└──────┬───────────────┘
       │ delivers to
┌──────▼───────────────┐
│      WORKERS          │
│  (via worker-sdk)     │
│  • Receive event      │
│  • Execute logic      │
│  • Publish results    │
└──────────────────────┘
```

---

## Package Dependency Graph

Read arrows as "depends on":

```
shared          ──── (no dependencies — foundation layer)
   │
   ├──▶ tracing          (branded IDs: TraceId, SpanId, CorrelationId)
   │
   ├──▶ metrics          (ICounter, IGauge, IHistogram, NoopMetricsRegistry)
   │
   ├──▶ topology         (graph of nodes + edges, validation)
   │
   └──▶ event-bus        ◀── also depends on tracing
            │
            └──▶ runtime ◀── also depends on tracing, metrics
                    │
                    └──▶ worker-sdk ◀── also depends on event-bus, tracing, metrics

ui              ──── depends on shared only  (React components, no business logic)

apps/api        ──── depends on ALL packages above
apps/dashboard  ──── depends on shared + ui  (Vite resolves, no TS project refs)
```

Rule: **lower layers never import from higher layers.** `shared` never imports `event-bus`. `event-bus` never imports `runtime`. Violations create circular dependencies and break builds.

---

## Layer 1 — `@beyondevent/shared` (Foundation)

Everything else depends on this. Contains only primitives — no logic that touches Node.js or any framework.

**What it provides:**

```
Branded scalar types (prevent mixing IDs accidentally):
  EventId       — identifies a single event instance
  WorkerId      — identifies a worker definition
  SimulationId  — identifies a running simulation
  TopologyId    — identifies a saved topology
  Timestamp     — number of milliseconds (Unix ms), branded
  SemVer        — "1.2.3" format, branded

Error hierarchy:
  BeyondEventError        (base)
  ├── ConfigurationError  (bad env/config)
  ├── ValidationError     (bad input)
  └── NotFoundError       (resource missing)

Utilities:
  generateId()   — crypto.randomUUID()
  assertNever()  — exhaustive switch guard

Constants:
  APP_NAME            = 'beyondevent'
  DEFAULT_TIMEOUT_MS  = 30_000
```

**Why branded types?** TypeScript's `string` is just `string` — you can accidentally pass a `WorkerId` where an `EventId` is expected and the compiler won't catch it. Branded types (`string & { __brand: 'EventId' }`) make that a compile error.

---

## Layer 2 — `@beyondevent/tracing`

Depends on: `shared`

Defines how every event and operation gets tagged for correlation across services. Every `DomainEvent` carries a `TraceContext`.

```
TraceId       — one logical operation across multiple services
SpanId        — one step within that operation
CorrelationId — groups all events from a single user action
CausationId   — points to the event that caused this one (null if root)

TraceContext {
  traceId:       TraceId
  spanId:        SpanId
  correlationId: CorrelationId
  causationId:   CausationId | null   ← null means "this started the chain"
}

ITracer {
  startSpan(name, parent?) → TraceContext   ← creates child span
  endSpan(ctx)                              ← closes the span
}

Factory functions (Phase 1 — create values):
  createTraceId()       → TraceId
  createSpanId()        → SpanId
  createCorrelationId() → CorrelationId
  createTraceContext()  → TraceContext
```

**Why four IDs?** In a distributed system, one user click might trigger 50 events across 10 services. You need:
- `traceId` to find ALL of them
- `correlationId` to group by user action
- `causationId` to reconstruct the causal chain (A caused B caused C)
- `spanId` to time individual steps

---

## Layer 2 — `@beyondevent/metrics`

Depends on: `shared`

Defines the metrics contract without coupling to any specific metrics backend (Prometheus, StatsD, CloudWatch — all fit behind these interfaces).

```
ICounter    { increment(labels?), add(value, labels?) }
IGauge      { set(value, labels?), increment(labels?), decrement(labels?) }
IHistogram  { observe(value, labels?) }
ITimer      { start() → stopFn }   ← stopFn() returns duration ms

IMetricsRegistry {
  counter(name, description)               → ICounter
  gauge(name, description)                 → IGauge
  histogram(name, description, buckets?)   → IHistogram
  timer(name, description)                 → ITimer
}

NoopMetricsRegistry — implements IMetricsRegistry, all methods do nothing
                       used in Phase 1 and tests

MetricNames {
  EVENT_THROUGHPUT   = 'beyondevent.event.throughput'
  EVENT_LATENCY      = 'beyondevent.event.latency'
  WORKER_RETRIES     = 'beyondevent.worker.retries'
  DLQ_SIZE           = 'beyondevent.dlq.size'
  CONSUMER_LAG       = 'beyondevent.consumer.lag'
  QUEUE_DEPTH        = 'beyondevent.queue.depth'
}
```

---

## Layer 2 — `@beyondevent/topology`

Depends on: `shared`

Models the *map* of your event-driven system — what services exist, how they connect. Used by the dashboard to draw the visual graph and by the runtime to validate simulation configurations.

```
NodeId, EdgeId   — branded strings

TopologyNode {
  id:       NodeId
  type:     string          (e.g. 'service', 'queue', 'worker')
  label:    string          (display name)
  metadata: Record<string, unknown>
}

TopologyEdge {
  id:     EdgeId
  source: NodeId
  target: NodeId
  label?: string            (event type that flows on this edge)
}

ITopologyGraph {
  addNode(node) / removeNode(id)
  addEdge(edge) / removeEdge(id)
  getNode(id) → TopologyNode | undefined
  getNeighbors(id) → TopologyNode[]
  validate() → { valid: boolean; errors: string[] }
  traverse(startId, visitor)
  toJSON() → TopologySnapshot   ← persisted to Postgres
}

createTopologyGraph() → ITopologyGraph
```

---

## Layer 3 — `@beyondevent/event-bus`

Depends on: `shared`, `tracing`

The messaging contract. Packages above this layer never care whether events go through Redis, Kafka, or an in-memory Map — they only talk to these interfaces.

```
DomainEvent<TPayload> {
  id:           EventId
  type:         EventType      ← branded string e.g. 'order.created'
  payload:      TPayload
  traceContext: TraceContext   ← full trace chain
  occurredAt:   Timestamp
  version:      number
}

EventHandler<TPayload> = (event: DomainEvent<TPayload>) => Promise<void>
Unsubscribe = () => void

IEventBus {
  publish(event)                         → Promise<void>
  subscribe(type, handler)               → Unsubscribe
  subscribeMany(types[], handler)        → Unsubscribe
}

IEventBusAdapter extends IEventBus {     ← adds connection lifecycle
  connect()    → Promise<void>
  disconnect() → Promise<void>
  isConnected: boolean
}

IReplayable {
  replayEvent(eventId)                   → Promise<void>
  replayTrace(traceId)                   → Promise<void>
  replaySimulation(simId, from?, to?)    → Promise<void>
}

IReplayableEventBusAdapter
  extends IEventBusAdapter, IReplayable  ← the full contract

Adapters (in adapters/ folder):
  createInMemoryEventBus()   → IReplayableEventBusAdapter  [Phase 1 — done]
  redis-streams/             → placeholder [Phase 3]
```

**Adapter pattern**: Only the `adapters/` folder contains implementations. The rest of the package is pure interfaces. Phase 3 adds a Redis Streams adapter — zero changes to any code that uses `IEventBus`.

---

## Layer 4 — `@beyondevent/runtime`

Depends on: `shared`, `tracing`, `event-bus`, `metrics`

The engine that drives everything. Owns lifecycle, scheduling, and the execution pipeline that every event passes through. **Must not depend on Redis or HTTP** — it is transport and framework agnostic.

```
ILifecycle {
  onStart(fn)          ← register hook, runs in order on start()
  onStop(fn)           ← register hook, runs in REVERSE order on stop() (LIFO)
  start() / stop()
  isRunning: boolean
}
createLifecycle() → ILifecycle

IScheduler {
  schedule(task: { id, executeAt, handler, retries? })
  cancel(taskId)
  shutdown()
}
createInMemoryScheduler() → IScheduler

IPipeline<TIn, TOut> {
  use(middleware) → this    ← chainable
  execute(input, ctx) → Promise<TOut>
}
createPipeline<TIn, TOut>() → IPipeline

IPipelineMiddleware<TEvent> {
  name: string
  execute(event, ctx, next) → Promise<void>   ← Koa-style next()
}

Middleware factories (stubs → implemented per phase):
  createValidationMiddleware()           [Phase 2]
  createTracingMiddleware(tracer)        [Phase 2]
  createMetricsMiddleware(registry)      [Phase 2]
  createChaosMiddleware()                [Phase 6]

IDispatcher {
  dispatch(workerId, input, ctx) → Promise<TOutput>
}
  ↑ interface only — implementation lives in api/bootstrap
    (runtime can't import worker-sdk without a circular dependency)
```

**Execution Pipeline** — every event passes through this chain:

```
DomainEvent arrives
      │
      ▼
┌─────────────┐
│  Validation │  ← reject malformed payloads early
└──────┬──────┘
       │
┌──────▼──────┐
│   Tracing   │  ← create child span, attach to event
└──────┬──────┘
       │
┌──────▼──────┐
│   Metrics   │  ← start timer, count throughput
└──────┬──────┘
       │
┌──────▼──────┐
│    Chaos    │  ← optionally inject faults (Phase 6)
└──────┬──────┘
       │
┌──────▼──────┐
│   Worker   │  ← your business logic runs here
└──────┬──────┘
       │
┌──────▼──────┐
│   Publish  │  ← resulting events go back onto the bus
└──────┬──────┘
       │
┌──────▼──────┐
│   Persist  │  ← write to Postgres for replay + audit
└─────────────┘
```

Each step is a middleware. Middleware calls `next()` to continue, or throws to abort. If it throws, the pipeline surfaces a DLQ (dead-letter queue) event.

---

## Layer 5 — `@beyondevent/worker-sdk`

Depends on: `shared`, `tracing`, `event-bus`, `runtime`, `metrics`

The developer-facing API. When someone builds a worker for BeyondEvent, this is the only package they need to know.

```
WorkerMetadata {
  id:          WorkerId
  name:        string
  version:     SemVer
  description: string
  tags:        string[]
}

WorkerContext {                ← injected into every execute() call
  traceContext: TraceContext
  eventBus:     IEventBus     ← publish new events from inside the worker
  tracer:       ITracer       ← create child spans
  metrics:      IMetricsRegistry
  log(level, msg, data?)
}

WorkerDefinition<TInput, TOutput> {
  metadata: WorkerMetadata
  execute(input: TInput, context: WorkerContext) → Promise<TOutput>
}

createWorker<TInput, TOutput>(definition) → WorkerDefinition
  ↑ identity function today — will add validation + registration in Phase 2
```

**Worker lifecycle** (per event received):

```
Subscribe → Receive → Validate → Execute → Publish → Ack
```

**Example worker** (from `examples/order-processing`):

```typescript
const orderWorker = createWorker<OrderInput, OrderOutput>({
  metadata: { id: '...' as WorkerId, name: 'order-processor', version: '1.0.0', ... },
  async execute(input, ctx) {
    ctx.log('info', 'processing order', { orderId: input.id });
    // do work...
    await ctx.eventBus.publish({ type: 'order.confirmed', payload: { ... }, ... });
    return { success: true };
  },
});
```

---

## `@beyondevent/ui`

Depends on: `shared` only. Peer deps: React 19.

Shared React component library. Used exclusively by `apps/dashboard`. Contains no application state or business logic.

```
Button, Card, CardHeader, CardContent, CardTitle
Badge, LoadingSpinner, ErrorBoundary
```

---

## Apps

### `apps/api`

The Node.js server. Depends on ALL packages. Entry point: `src/main.ts`.

```
src/
  main.ts          ← bootstrap() → lifecycle.start() → listen() → SIGTERM handler
  bootstrap.ts     ← wires everything together, returns BootstrapContext
  config/          ← Zod-validated env schema (DATABASE_URL, REDIS_URL, API_PORT, ...)
  server.ts        ← Fastify app factory (CORS, Zod type provider, routes)
  routes/
    health.ts      ← GET /health, /health/ready, /health/live
    v1/
      simulations.ts   ← stub (Phase 2)
      topologies.ts    ← stub (Phase 2)
      workers.ts       ← stub (Phase 2)
  ws/
    gateway.ts     ← WebSocket gateway (Phase 4)
  db/
    schema/        ← Drizzle table definitions (events, traces, simulations, ...)
```

`BootstrapContext` is the wiring harness:

```typescript
{
  config:     Env                          // validated environment
  db:         DbClient                     // Drizzle Postgres client
  eventBus:   IReplayableEventBusAdapter   // InMemory now, Redis in Phase 3
  lifecycle:  ILifecycle                   // manages start/stop hooks
}
```

### `apps/dashboard`

Vite + React + TanStack Router + React Flow. No TypeScript project references — Vite resolves packages via pnpm symlinks.

```
src/
  main.tsx              ← Router + QueryClient setup
  routes/
    __root.tsx          ← root layout
    index.tsx           ← landing page stub
  store/
    app-store.ts        ← Zustand: isConnected, activeSimulationId
  styles/globals.css    ← Tailwind v4 via @import
```

---

## How It All Connects — Event Flow Example

Scenario: user triggers "run simulation" from the dashboard.

```
1. Dashboard          POST /api/v1/simulations         (HTTP)
        │
2. API (Fastify)      validates body with Zod
        │             creates simulation row in Postgres
        │             calls runtime.dispatch(workerId, input, ctx)
        │
3. Runtime            runs event through pipeline:
   Pipeline           Validation → Tracing → Metrics → Chaos → Worker → Publish → Persist
        │
4. Worker SDK         execute(input, workerContext)
        │             worker publishes result events via ctx.eventBus.publish(...)
        │
5. Event Bus          delivers to all subscribers
   (InMemory)         stores event in replay store
        │
6. API WebSocket      picks up published events
   Gateway            streams them to dashboard via socket.io
        │
7. Dashboard          React Flow canvas updates in real time
                      timeline panel shows event sequence
                      metrics panel updates throughput/latency
```

---

## Phase Roadmap

| Phase | What gets built | Key packages |
|-------|----------------|--------------|
| 1 — Bootstrap | Skeleton, interfaces, InMemoryEventBus | all (stubs) |
| 2 — Runtime | Pipeline middleware, Lifecycle, Scheduler | `runtime` |
| 3 — Event Bus | Redis Streams adapter | `event-bus/adapters/redis-streams` |
| 4 — Dashboard | React Flow canvas, WebSocket streaming | `dashboard`, `ws/gateway` |
| 5 — Replay | `replayTrace`, `replaySimulation` UI | `event-bus`, `dashboard` |
| 6 — Chaos | `createChaosMiddleware`, fault injection | `runtime` middleware |
| 7 — Multi-broker | Kafka/RabbitMQ adapters | `event-bus/adapters/` |

Each phase builds *on top of* the interfaces established in Phase 1. The interfaces don't change — only implementations are added or swapped.

---

## Key Design Rules

**1. Interfaces first, implementations second.**
Every package exports interfaces before it exports classes. Code that uses a package depends on the interface (`IEventBus`), not the implementation (`InMemoryEventBusAdapterImpl`).

**2. Adapters are swappable.**
`createInMemoryEventBus()` → `createRedisStreamsAdapter()` — callers don't change. This is why `IEventBusAdapter` exists.

**3. The `adapters/` folder is the only sub-folder with its own `index.ts`.**
All other code lives flat in `src/`: `types.ts`, `interfaces.ts`, `impl.ts`. Only `adapters/` gets a barrel because it can have multiple adapter implementations.

**4. Dependency direction is strictly downward.**
`shared` ← `tracing`/`metrics`/`topology` ← `event-bus` ← `runtime` ← `worker-sdk` ← `api`.
Never the other way. Circular imports cause build failures and conceptual confusion.

**5. `runtime` never touches Redis or HTTP.**
It is the engine. Transport and protocol details live in `apps/api` and `event-bus/adapters`.
