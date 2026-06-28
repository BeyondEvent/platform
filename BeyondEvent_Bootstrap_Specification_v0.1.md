
# BeyondEvent — Project Bootstrap Specification (v0.1)

> This document is intended for an autonomous coding agent.
>
> The objective is **NOT** to implement the product.
>
> The objective is to generate a **production-quality monorepo skeleton** that establishes the architecture, tooling, package boundaries, and developer experience for BeyondEvent.

---

# Project Context

BeyondEvent is an open-source developer platform for **designing, executing, observing and debugging event-driven systems**.

Think of it as:

- React Flow
- Temporal UI
- Kafka UI
- Jaeger
- Grafana

combined into a single platform for learning and experimenting with distributed systems.

This repository should be treated as a long-term platform, not a demo application.

---

# Guiding Principles

1. Event-first architecture.
2. Modular monorepo.
3. Clean Architecture.
4. Framework-light backend.
5. Type-safe everywhere.
6. Infrastructure adapters are replaceable.
7. Runtime is transport agnostic.
8. No business logic inside HTTP handlers.
9. Every package should have a single responsibility.
10. Production-ready developer experience from day one.

---

# Tech Stack

## Workspace

- pnpm workspaces
- Turbo
- Biome
- TypeScript (strict)
- Changesets
- Husky
- lint-staged

## Backend

- Node.js 24+
- Fastify
- Drizzle ORM
- PostgreSQL
- Redis Streams
- BullMQ
- Socket.IO
- Zod
- Pino

## Frontend

- React
- Vite
- TanStack Router
- TanStack Query
- React Flow
- Zustand
- TailwindCSS
- shadcn/ui

---

# Repository Structure

```text
beyondevent/

apps/
    api/
    dashboard/
    docs/

packages/
    runtime/
    event-bus/
    worker-sdk/
    topology/
    tracing/
    metrics/
    shared/
    ui/

examples/
    order-processing/
    flash-sale/
    payment-failure/

docker/
scripts/
configs/
.github/
```

---

# Expectations

The coding agent MUST:

- generate every workspace
- configure TypeScript project references
- configure pnpm workspaces
- configure Turbo
- configure Biome
- configure shared tsconfig
- configure path aliases
- configure linting
- configure formatting
- configure testing
- configure Docker
- create README for every package
- expose public APIs using barrel exports
- avoid placeholder code that will later need deleting

---

# apps/api

Purpose:

Fastify control plane.

Responsibilities

- REST API
- WebSocket gateway
- Simulation control
- Health endpoints
- Runtime bootstrap

Folders

```text
src/
    app/
    api/
    websocket/
    config/
    bootstrap/
    modules/
    plugins/
```

Do NOT implement business logic.

---

# apps/dashboard

Purpose

Visual interface.

Responsibilities

- React Flow canvas
- Dashboard
- Metrics
- Timeline
- Worker inspector
- Queue inspector

Configure

- TanStack Router
- TanStack Query
- Zustand
- Tailwind
- shadcn/ui

---

# apps/docs

Purpose

Documentation site only.

Prepare for future documentation.

---

# runtime package

Purpose

Core execution engine.

Expose interfaces only.

Responsibilities

- scheduler
- lifecycle
- dispatcher
- execution pipeline

Do NOT couple runtime to Redis.

---

# event-bus package

Purpose

Transport abstraction.

Create interfaces.

Future implementations

- Redis Streams
- Kafka
- RabbitMQ
- NATS

Current implementation folder

```text
redis-streams/
```

---

# worker-sdk

Expose

```ts
createWorker()

WorkerContext

WorkerDefinition

WorkerMetadata
```

Workers communicate ONLY through EventBus.

---

# topology

Maintain directed graph.

Responsibilities

- nodes
- edges
- validation
- traversal

No UI code.

---

# tracing

Provide

- TraceId
- SpanId
- CorrelationId
- CausationId

No OpenTelemetry dependency yet.

---

# metrics

Provide interfaces for

- counters
- gauges
- histograms
- timers

Implementation deferred.

---

# shared

Contains

- types
- utilities
- constants
- errors

No runtime dependencies.

---

# ui

Shared React components.

No application state.

---

# Coding Standards

- Strict TypeScript.
- No any.
- Functional composition preferred.
- Small modules.
- Dependency inversion.
- Barrel exports.
- Named exports.
- Async/await only.
- ESM only.

---

# Architecture Rules

Forbidden

- circular dependencies
- package-to-package deep imports
- hidden globals
- singleton abuse

Required

- dependency injection
- interface-driven design
- composition over inheritance

---

# Root Configuration

Create

- package.json
- pnpm-workspace.yaml
- turbo.json
- biome.json
- tsconfig.base.json
- .editorconfig
- .gitignore
- .env.example
- docker-compose.yml
- README.md

---

# Docker

Prepare services

- postgres
- redis

Health checks required.

---

# CI

Prepare GitHub Actions

- install
- typecheck
- lint
- test
- build

---

# Deliverables

The coding agent should ONLY create:

- folder structure
- configuration
- build system
- workspace wiring
- shared abstractions
- interfaces
- package exports
- empty implementations where appropriate

The coding agent MUST NOT implement:

- event processing
- runtime logic
- Redis Streams
- frontend pages
- business features
- authentication
- persistence logic

Those will be implemented incrementally.

---

# Success Criteria

At the end of bootstrap:

- `pnpm install` succeeds.
- `pnpm build` succeeds.
- `pnpm lint` succeeds.
- `pnpm typecheck` succeeds.
- `pnpm dev` starts API and Dashboard.
- Every package compiles independently.
- Package boundaries are clean.
- Repository is ready for iterative feature development.
