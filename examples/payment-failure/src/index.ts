import type { EventType } from '@beyondevent/event-bus';
import type { EventId, SemVer, Timestamp, WorkerId } from '@beyondevent/shared';
import type { WorkerDefinition } from '@beyondevent/worker-sdk';
import { createWorker } from '@beyondevent/worker-sdk';

interface PaymentInput {
  readonly paymentId: string;
  readonly orderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly attempt: number;
}

interface PaymentOutput {
  readonly paymentId: string;
  readonly status: 'SUCCEEDED' | 'FAILED' | 'RETRYING';
  readonly nextRetryAt?: number;
}

const paymentProcessor: WorkerDefinition<PaymentInput, PaymentOutput> = createWorker({
  metadata: {
    id: 'payment-processor' as WorkerId,
    name: 'Payment Processor',
    version: '1.0.0' as SemVer,
    description: 'Processes payments with retry logic and DLQ on exhaustion',
    tags: ['payment', 'retry', 'dlq', 'example'],
  },
  async execute(input, context) {
    context.log('info', 'Processing payment', {
      paymentId: input.paymentId,
      attempt: input.attempt,
    });

    await context.eventBus.publish({
      id: crypto.randomUUID() as EventId,
      type: 'payment.attempted' as EventType,
      payload: { paymentId: input.paymentId, orderId: input.orderId, attempt: input.attempt },
      traceContext: context.traceContext,
      occurredAt: Date.now() as Timestamp,
      version: 1,
      simulationId: undefined,
    });

    return { paymentId: input.paymentId, status: 'FAILED' };
  },
});

export { paymentProcessor };
