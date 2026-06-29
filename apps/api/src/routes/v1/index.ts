import type { FastifyInstance } from 'fastify';
import { chaosRoutes } from './chaos';
import { eventRoutes } from './events';
import { metricsRoutes } from './metrics';
import { replayRoutes } from './replay';
import { simulationRoutes } from './simulations';
import { topologyRoutes } from './topologies';
import { workerRoutes } from './workers';

export async function v1Routes(app: FastifyInstance): Promise<void> {
  app.get('/', async () => ({
    api: 'BeyondEvent API',
    version: 'v1',
  }));

  // Phase 7: broker info endpoint
  app.get('/broker', async () => ({
    type: app.brokerType,
    connected: app.eventBus.isConnected,
  }));

  await app.register(simulationRoutes, { prefix: '/simulations' });
  await app.register(topologyRoutes, { prefix: '/topologies' });
  await app.register(workerRoutes, { prefix: '/workers' });
  await app.register(eventRoutes, { prefix: '/events' });
  await app.register(replayRoutes, { prefix: '/replay' });
  await app.register(chaosRoutes, { prefix: '/chaos' });
  await app.register(metricsRoutes, { prefix: '/metrics' });
}
