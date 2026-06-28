import type { FastifyInstance } from 'fastify';
import { eventRoutes } from './events';
import { replayRoutes } from './replay';
import { simulationRoutes } from './simulations';
import { topologyRoutes } from './topologies';
import { workerRoutes } from './workers';

export async function v1Routes(app: FastifyInstance): Promise<void> {
  app.get('/', async () => ({
    api: 'BeyondEvent API',
    version: 'v1',
  }));

  await app.register(simulationRoutes, { prefix: '/simulations' });
  await app.register(topologyRoutes, { prefix: '/topologies' });
  await app.register(workerRoutes, { prefix: '/workers' });
  await app.register(eventRoutes, { prefix: '/events' });
  await app.register(replayRoutes, { prefix: '/replay' });
}
