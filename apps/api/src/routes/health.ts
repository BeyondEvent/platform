import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  timestamp: z.number(),
  uptime: z.number(),
  version: z.string(),
});

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        response: { 200: HealthResponseSchema },
      },
    },
    async () => ({
      status: 'ok' as const,
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '0.0.0',
    }),
  );

  app.get('/health/ready', async (_req, reply) => {
    await reply.status(200).send({ ready: true });
  });

  app.get('/health/live', async (_req, reply) => {
    await reply.status(200).send({ live: true });
  });
}
