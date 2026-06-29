import * as Dotenv from 'dotenv';
import { bootstrap } from './bootstrap';
import { createApp } from './server';

async function main(): Promise<void> {
  // Path relative to CWD (apps/api/) when run via pnpm
  Dotenv.config({ path: '../../.env' });
  const ctx = await bootstrap();
  const app = await createApp(ctx);

  app.log.info(`[DB] Connected — ${ctx.config.DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`);
  if (ctx.brokerType === 'redis') {
    app.log.info(`[Broker] Redis Streams connected — ${ctx.config.REDIS_URL}`);
  } else if (ctx.config.REDIS_URL) {
    app.log.warn(`[Broker] Redis unreachable (${ctx.config.REDIS_URL}), using in-memory fallback`);
  } else {
    app.log.info('[Broker] In-memory event bus (no REDIS_URL configured)');
  }

  // Attach WebSocket gateway to Fastify's underlying HTTP server before listening.
  ctx.gateway.attach(app.server);

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`[${signal}] shutting down`);
    await app.close();
    await ctx.lifecycle.stop();
    process.exitCode = 0;
  };

  process.once('SIGTERM', () => void shutdown('SIGTERM'));
  process.once('SIGINT', () => void shutdown('SIGINT'));

  await ctx.lifecycle.start();
  await app.listen({ port: ctx.config.API_PORT, host: ctx.config.API_HOST });
}

main().catch((error: unknown) => {
  console.error('[Fatal]', error);
  process.exitCode = 1;
});
