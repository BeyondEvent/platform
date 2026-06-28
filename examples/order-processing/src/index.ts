import type { EventType } from '@beyondevent/event-bus';
import type { EventId, SemVer, Timestamp, WorkerId } from '@beyondevent/shared';
import type { WorkerDefinition } from '@beyondevent/worker-sdk';
import { createWorker } from '@beyondevent/worker-sdk';

interface OrderInput {
  readonly orderId: string;
  readonly customerId: string;
  readonly amount: number;
  readonly currency: string;
}

interface OrderOutput {
  readonly orderId: string;
  readonly status: 'ACCEPTED' | 'REJECTED';
  readonly reason?: string;
}

const orderProcessor: WorkerDefinition<OrderInput, OrderOutput> = createWorker({
  metadata: {
    id: 'order-processor' as WorkerId,
    name: 'Order Processor',
    version: '1.0.0' as SemVer,
    description: 'Validates and accepts incoming orders',
    tags: ['order', 'example'],
  },
  async execute(input, context) {
    context.log('info', 'Processing order', { orderId: input.orderId });

    await context.eventBus.publish({
      id: crypto.randomUUID() as EventId,
      type: 'order.received' as EventType,
      payload: { orderId: input.orderId, customerId: input.customerId },
      traceContext: context.traceContext,
      occurredAt: Date.now() as Timestamp,
      version: 1,
      simulationId: undefined,
    });

    return { orderId: input.orderId, status: 'ACCEPTED' };
  },
});

export { orderProcessor };
