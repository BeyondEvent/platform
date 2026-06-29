import { createInMemoryEventBus, createRedisStreamsAdapter } from '@beyondevent/event-bus';
import type { IReplayableEventBusAdapter } from '@beyondevent/event-bus';
import { NoopMetricsRegistry } from '@beyondevent/metrics';
import type { IMetricsRegistry } from '@beyondevent/metrics';
import { createLifecycle } from '@beyondevent/runtime';
import type { ILifecycle } from '@beyondevent/runtime';
import { sql } from 'drizzle-orm';
import { loadConfig } from './config/env';
import type { Env } from './config/schema';
import { createDbClient } from './db';
import type { DbClient } from './db';
import { startEventPersister } from './plugins/event-persister';
import { createWebSocketGateway } from './ws/gateway';
import type { IWebSocketGateway } from './ws/gateway';

export interface BootstrapContext {
  readonly config: Env;
  readonly db: DbClient;
  readonly eventBus: IReplayableEventBusAdapter;
  readonly lifecycle: ILifecycle;
  readonly metrics: IMetricsRegistry;
  readonly gateway: IWebSocketGateway;
  readonly brokerType: 'redis' | 'memory';
}

async function createEventBus(
  redisUrl: string | undefined,
): Promise<{ bus: IReplayableEventBusAdapter; brokerType: 'redis' | 'memory' }> {
  if (redisUrl) {
    try {
      const bus = createRedisStreamsAdapter({ url: redisUrl });
      await bus.connect();
      return { bus, brokerType: 'redis' };
    } catch (err) {
      console.warn('[bootstrap] Redis unavailable, falling back to in-memory bus:', err);
    }
  }
  const bus = createInMemoryEventBus();
  await bus.connect();
  return { bus, brokerType: 'memory' };
}

export async function bootstrap(): Promise<BootstrapContext> {
  const config = loadConfig();

  const db = createDbClient(config.DATABASE_URL);
  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    throw new Error('Failed to connect to the database. Please check your DATABASE_URL.');
  }

  const { bus: eventBus, brokerType } = await createEventBus(config.REDIS_URL);

  const metrics: IMetricsRegistry = NoopMetricsRegistry;

  const gateway = createWebSocketGateway(eventBus, {
    corsOrigin: config.NODE_ENV !== 'production',
  });

  const stopPersister = startEventPersister(eventBus, db);

  const lifecycle = createLifecycle();
  lifecycle.onStop(async () => await eventBus.disconnect());
  lifecycle.onStop(async () => stopPersister());
  lifecycle.onStop(async () => await gateway.close());

  return { config, db, eventBus, lifecycle, metrics, gateway, brokerType };
}
