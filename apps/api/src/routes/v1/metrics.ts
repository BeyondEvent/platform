import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import { count, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { events, simulations, workers } from '../../db';

export async function metricsRoutes(app: FastifyInstance): Promise<void> {
  const a = app.withTypeProvider<ZodTypeProvider>();

  a.get(
    '/summary',
    {
      schema: {
        tags: ['Metrics'],
        response: {
          200: z.object({
            totalEvents: z.number().int(),
            totalSimulations: z.number().int(),
            runningSimulations: z.number().int(),
            completedSimulations: z.number().int(),
            activeWorkers: z.number().int(),
            brokerType: z.enum(['redis', 'memory']),
            brokerConnected: z.boolean(),
          }),
        },
      },
    },
    async () => {
      const [[evtRow], [simRow], [runRow], [cmpRow], [wrkRow]] = await Promise.all([
        app.db.select({ c: count() }).from(events),
        app.db.select({ c: count() }).from(simulations),
        app.db.select({ c: count() }).from(simulations).where(eq(simulations.status, 'running')),
        app.db.select({ c: count() }).from(simulations).where(eq(simulations.status, 'completed')),
        app.db.select({ c: count() }).from(workers),
      ]);
      return {
        totalEvents: evtRow?.c ?? 0,
        totalSimulations: simRow?.c ?? 0,
        runningSimulations: runRow?.c ?? 0,
        completedSimulations: cmpRow?.c ?? 0,
        activeWorkers: wrkRow?.c ?? 0,
        brokerType: app.brokerType,
        brokerConnected: app.eventBus.isConnected,
      };
    },
  );
}
