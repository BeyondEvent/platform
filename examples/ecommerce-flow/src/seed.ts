/**
 * E-Commerce Order Flow — Demo Seed
 *
 * Creates a topology, simulation, and worker via the BeyondEvent API,
 * then starts the simulation so you can watch it in the dashboard.
 *
 * Usage:
 *   pnpm --filter @beyondevent/examples-ecommerce-flow seed
 *
 * Topology (branching DAG):
 *
 *   API Gateway ──order.placed──► Order Service ──inventory.reserve.requested──► Inventory Service ──┐
 *                                       │                                                             │
 *                                       └──fraud.check.requested──► Fraud Detection ──fraud.cleared──┤
 *                                                                                                     ▼
 *                                                                                            Payment Service ──payment.captured──► Notification Service
 */

const API = process.env.API_URL ?? 'http://localhost:3000';
const DASHBOARD = process.env.DASHBOARD_URL ?? 'http://localhost:5173';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

interface CreatedTopology {
  id: string;
}
interface CreatedSimulation {
  id: string;
}

async function seed(): Promise<void> {
  console.log('BeyondEvent — E-Commerce Flow Demo Seed');
  console.log('========================================\n');

  // ── 1. Topology ─────────────────────────────────────────────────────────────
  const topology = await request<CreatedTopology>('POST', '/api/v1/topologies', {
    name: 'E-Commerce Order Flow',
    nodes: [
      {
        id: 'api-gw',
        type: 'service',
        label: 'API Gateway',
        metadata: { position: { x: 0, y: 200 } },
      },
      {
        id: 'order-svc',
        type: 'service',
        label: 'Order Service',
        metadata: { position: { x: 220, y: 200 } },
      },
      {
        id: 'inventory-svc',
        type: 'service',
        label: 'Inventory Service',
        metadata: { position: { x: 480, y: 60 } },
      },
      {
        id: 'fraud-svc',
        type: 'service',
        label: 'Fraud Detection',
        metadata: { position: { x: 480, y: 340 } },
      },
      {
        id: 'payment-svc',
        type: 'service',
        label: 'Payment Service',
        metadata: { position: { x: 740, y: 200 } },
      },
      {
        id: 'notify-svc',
        type: 'service',
        label: 'Notification Service',
        metadata: { position: { x: 980, y: 200 } },
      },
    ],
    edges: [
      { id: 'e1', source: 'api-gw', target: 'order-svc', label: 'order.placed' },
      {
        id: 'e2',
        source: 'order-svc',
        target: 'inventory-svc',
        label: 'inventory.reserve.requested',
      },
      {
        id: 'e3',
        source: 'order-svc',
        target: 'fraud-svc',
        label: 'fraud.check.requested',
      },
      {
        id: 'e4',
        source: 'inventory-svc',
        target: 'payment-svc',
        label: 'inventory.reserved',
      },
      {
        id: 'e5',
        source: 'fraud-svc',
        target: 'payment-svc',
        label: 'fraud.cleared',
      },
      {
        id: 'e6',
        source: 'payment-svc',
        target: 'notify-svc',
        label: 'payment.captured',
      },
    ],
  });
  console.log(`[1/4] Topology created       id=${topology.id}`);

  // ── 2. Simulation ────────────────────────────────────────────────────────────
  const sim = await request<CreatedSimulation>('POST', '/api/v1/simulations', {
    name: 'E-Commerce Order Flow — Demo Run',
    topologyId: topology.id,
  });
  console.log(`[2/4] Simulation created     id=${sim.id}`);

  // ── 3. Worker ────────────────────────────────────────────────────────────────
  await request('POST', '/api/v1/workers', {
    workerId: 'ecommerce-order-processor',
    name: 'Order Processor',
    version: '1.0.0',
    tags: ['ecommerce', 'orders', 'inventory', 'demo'],
  });
  console.log('[3/4] Worker registered      workerId=ecommerce-order-processor');

  // ── 4. Start ─────────────────────────────────────────────────────────────────
  await request('PATCH', `/api/v1/simulations/${sim.id}/status`, {
    status: 'running',
  });
  console.log('[4/4] Simulation started\n');

  console.log('Dashboard:');
  console.log(`  Simulation  ${DASHBOARD}/simulations/${sim.id}`);
  console.log(`  Topologies  ${DASHBOARD}/topologies`);
  console.log(`  Workers     ${DASHBOARD}/workers`);
  console.log('');
  console.log('The simulation runs ~6 events across the branching DAG,');
  console.log('then auto-completes. Re-run this script to seed another run.');
}

seed().catch((err: unknown) => {
  console.error('\nSeed failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
