# @beyondevent/api

Fastify control plane for BeyondEvent.

## Responsibilities

- REST API (control plane only: simulations, topologies, workers, health)
- WebSocket gateway (real-time runtime updates to dashboard)
- Runtime bootstrap
- Database schema (Drizzle + PostgreSQL)

## Development

```sh
cp ../../.env.example .env
pnpm dev
```

API starts on `http://localhost:3000`.

## Endpoints

- `GET /health` — health check
- `GET /health/ready` — readiness probe
- `GET /health/live` — liveness probe
- `GET /api/v1/simulations` — list simulations (Phase 2)
- `POST /api/v1/simulations` — create simulation (Phase 2)
- `GET /api/v1/topologies` — list topologies (Phase 2)
- `GET /api/v1/workers` — list workers (Phase 2)
