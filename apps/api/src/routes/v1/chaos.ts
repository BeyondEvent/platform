import type { ZodTypeProvider } from '@fastify/type-provider-zod';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { ChaosConfigUpdate } from '../../plugins/chaos-store';
import { deleteChaosConfig, getChaosConfig, setChaosConfig } from '../../plugins/chaos-store';

const ChaosConfigSchema = z.object({
  enabled: z.boolean(),
  faultRate: z.number().min(0).max(1),
  latencyMs: z.number().int().min(0),
  errorMessage: z.string(),
  duplicateRate: z.number().min(0).max(1),
});

export async function chaosRoutes(app: FastifyInstance): Promise<void> {
  const a = app.withTypeProvider<ZodTypeProvider>();

  a.get(
    '/:simulationId',
    {
      schema: {
        tags: ['Chaos'],
        params: z.object({ simulationId: z.uuid() }),
        response: { 200: ChaosConfigSchema },
      },
    },
    async (req) => getChaosConfig(req.params.simulationId),
  );

  a.put(
    '/:simulationId',
    {
      schema: {
        tags: ['Chaos'],
        params: z.object({ simulationId: z.uuid() }),
        body: ChaosConfigSchema.partial(),
        response: { 200: ChaosConfigSchema },
      },
    },
    async (req) => setChaosConfig(req.params.simulationId, req.body as ChaosConfigUpdate),
  );

  a.delete(
    '/:simulationId',
    {
      schema: {
        tags: ['Chaos'],
        params: z.object({ simulationId: z.uuid() }),
        response: { 204: z.null() },
      },
    },
    async (req, reply) => {
      deleteChaosConfig(req.params.simulationId);
      return reply.status(204).send(null);
    },
  );
}
