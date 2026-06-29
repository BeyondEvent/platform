import { createInMemoryEventBus } from '@beyondevent/event-bus';
import type { EventType } from '@beyondevent/event-bus';
import type { EventId, SemVer, Timestamp, WorkerId } from '@beyondevent/shared';
import { generateId } from '@beyondevent/shared';
import { createWorker, createWorkerRuntime, registerWorker } from '@beyondevent/worker-sdk';
import type { ITracer, TraceContext, WorkerDefinition } from '@beyondevent/worker-sdk';

// Inline NoopTracer — @beyondevent/tracing not a direct dep of this example
const NoopTracer: ITracer = {
  startSpan(_name: string, parent?: TraceContext): TraceContext {
    return {
      traceId: (parent?.traceId ?? generateId()) as TraceContext['traceId'],
      spanId: generateId() as TraceContext['spanId'],
      correlationId: (parent?.correlationId ?? generateId()) as TraceContext['correlationId'],
      causationId: (parent?.spanId ?? null) as TraceContext['causationId'],
    };
  },
  endSpan(_ctx: TraceContext): void {
    // noop
  },
};

// Inline NoopMetricsRegistry — @beyondevent/metrics not a direct dep of this example
const NoopCounter = { increment: () => undefined, add: () => undefined };
const NoopGauge = { set: () => undefined, increment: () => undefined, decrement: () => undefined };
const NoopHistogram = { observe: () => undefined };
const NoopTimer = { start: () => () => 0 };
const NoopMetricsRegistry = {
  counter: () => NoopCounter,
  gauge: () => NoopGauge,
  histogram: () => NoopHistogram,
  timer: () => NoopTimer,
};

interface OrderInput {
  readonly orderId: string;
  readonly customerId: string;
  readonly amount: number;
}

interface OrderOutput {
  readonly orderId: string;
  readonly status: 'ACCEPTED' | 'REJECTED';
}

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const orderProcessor: WorkerDefinition<OrderInput, OrderOutput> = createWorker({
  metadata: {
    id: 'order-processor' as WorkerId,
    name: 'Order Processor',
    version: '1.0.0' as SemVer,
    description: 'Validates and accepts incoming orders, emits order.validated or order.rejected',
    tags: ['order', 'example'],
  },
  async execute(input, context) {
    context.log('info', `Processing order ${input.orderId}`, { amount: input.amount });

    // Business rule: reject orders over $10,000
    const accepted = input.amount <= 10_000;

    await context.eventBus.publish({
      id: generateId() as EventId,
      type: (accepted ? 'order.validated' : 'order.rejected') as EventType,
      payload: {
        orderId: input.orderId,
        status: accepted ? 'ACCEPTED' : 'REJECTED',
        amount: input.amount,
      },
      traceContext: context.traceContext,
      occurredAt: Date.now() as Timestamp,
      version: 1,
      simulationId: undefined,
    });

    context.log('info', `Order ${input.orderId} ${accepted ? 'accepted' : 'rejected'}`);
    return { orderId: input.orderId, status: accepted ? 'ACCEPTED' : 'REJECTED' };
  },
});

async function main(): Promise<void> {
  console.log('[order-processing] Starting…');

  const eventBus = createInMemoryEventBus();
  await eventBus.connect();

  const handle = createWorkerRuntime(orderProcessor, {
    eventBus,
    tracer: NoopTracer,
    metrics: NoopMetricsRegistry,
    subscribeTo: ['order.received' as EventType],
  });

  // Register with the BeyondEvent API for dashboard visibility (optional)
  const registration = await registerWorker(
    {
      apiUrl: API_URL,
      workerId: 'order-processor-1',
      name: orderProcessor.metadata.name,
      version: orderProcessor.metadata.version,
      tags: [...orderProcessor.metadata.tags],
    },
    () => handle.state,
  ).catch((err: unknown) => {
    console.warn('[order-processing] API registration skipped (running standalone):', err);
    return null;
  });

  console.log('[order-processing] Worker ready — listening for order.received events');
  if (registration) {
    console.log(`[order-processing] Registered in dashboard (id: ${registration.rowId})`);
  }

  // Demo: fire a test event so the worker actually does something on startup
  await eventBus.publish({
    id: generateId() as EventId,
    type: 'order.received' as EventType,
    payload: { orderId: 'demo-001', customerId: 'cust-abc', amount: 250 },
    traceContext: NoopTracer.startSpan('demo'),
    occurredAt: Date.now() as Timestamp,
    version: 1,
    simulationId: undefined,
  });

  // Graceful shutdown
  process.once('SIGINT', () => {
    void (async () => {
      console.log('[order-processing] Shutting down…');
      await handle.stop();
      if (registration) await registration.deregister().catch(() => undefined);
      await eventBus.disconnect();
      process.exitCode = 0;
    })();
  });
}

main().catch((err: unknown) => {
  console.error('[order-processing] Fatal:', err);
  process.exitCode = 1;
});
