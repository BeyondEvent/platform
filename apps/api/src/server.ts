import type { IReplayableEventBusAdapter } from '@beyondevent/event-bus';
import type { IMetricsRegistry } from '@beyondevent/metrics';
import { generateId } from '@beyondevent/shared';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { BootstrapContext } from './bootstrap';
import type { DbClient } from './db';
import { healthRoutes } from './routes/health';
import { v1Routes } from './routes/v1/index';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbClient;
    eventBus: IReplayableEventBusAdapter;
    metrics: IMetricsRegistry;
    brokerType: 'redis' | 'memory';
  }
}

export async function createApp(ctx: BootstrapContext): Promise<FastifyInstance> {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    genReqId: () => generateId(),
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: ctx.config.NODE_ENV !== 'production' });

  app.decorate('db', ctx.db);
  app.decorate('eventBus', ctx.eventBus);
  app.decorate('metrics', ctx.metrics);
  app.decorate('brokerType', ctx.brokerType);

  await app.register(healthRoutes);
  await app.register(v1Routes, { prefix: '/api/v1' });

  return app;
}
