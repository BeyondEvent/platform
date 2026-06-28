import type { EventType } from '@beyondevent/event-bus';
import type { EventId, SemVer, Timestamp, WorkerId } from '@beyondevent/shared';
import type { WorkerDefinition } from '@beyondevent/worker-sdk';
import { createWorker } from '@beyondevent/worker-sdk';

interface FlashSaleInput {
  readonly saleId: string;
  readonly productId: string;
  readonly userId: string;
  readonly quantity: number;
}

interface FlashSaleOutput {
  readonly saleId: string;
  readonly userId: string;
  readonly status: 'RESERVED' | 'SOLD_OUT' | 'LIMIT_EXCEEDED';
}

const flashSaleProcessor: WorkerDefinition<FlashSaleInput, FlashSaleOutput> = createWorker({
  metadata: {
    id: 'flash-sale-processor' as WorkerId,
    name: 'Flash Sale Processor',
    version: '1.0.0' as SemVer,
    description: 'Handles high-throughput flash sale reservations under contention',
    tags: ['flash-sale', 'example', 'high-throughput'],
  },
  async execute(input, context) {
    context.log('info', 'Processing flash sale reservation', {
      saleId: input.saleId,
      userId: input.userId,
    });

    await context.eventBus.publish({
      id: crypto.randomUUID() as EventId,
      type: 'flash-sale.reservation.attempted' as EventType,
      payload: { saleId: input.saleId, userId: input.userId, quantity: input.quantity },
      traceContext: context.traceContext,
      occurredAt: Date.now() as Timestamp,
      version: 1,
      simulationId: undefined,
    });

    return { saleId: input.saleId, userId: input.userId, status: 'RESERVED' };
  },
});

export { flashSaleProcessor };
