import type { DomainEvent } from '@beyondevent/event-bus';
import type { WorkerContext, WorkerDefinition, WorkerHandle, WorkerRunOptions } from './interfaces';
import type { WorkerLifecycleState } from './types';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`worker timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e: unknown) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

export function createWorkerRuntime<TInput, TOutput>(
  definition: WorkerDefinition<TInput, TOutput>,
  options: WorkerRunOptions,
): WorkerHandle<TInput, TOutput> {
  // ponytail: single state var shared across concurrent events — fine for Phase 2 (in-memory,
  // single-threaded). Phase 3 (Redis consumer groups) delivers one event at a time per instance.
  let lifecycleState: WorkerLifecycleState = 'subscribing';

  const { eventBus, tracer, metrics, subscribeTo, maxRetries = 3, timeoutMs = 30_000 } = options;
  const name = definition.metadata.name;

  const buildContext = (traceCtx: WorkerContext['traceContext']): WorkerContext => ({
    traceContext: traceCtx,
    eventBus,
    tracer,
    metrics,
    log(level, msg, data) {
      const m = `[${name}] ${msg}`;
      if (level === 'error') data !== undefined ? console.error(m, data) : console.error(m);
      else if (level === 'warn') data !== undefined ? console.warn(m, data) : console.warn(m);
      else if (level === 'info') data !== undefined ? console.info(m, data) : console.info(m);
      else data !== undefined ? console.debug(m, data) : console.debug(m);
    },
  });

  const unsubscribe = eventBus.subscribeMany(subscribeTo, async (event: DomainEvent) => {
    lifecycleState = 'receiving';
    const span = tracer.startSpan(name, event.traceContext);
    const ctx = buildContext(span);
    const maxAttempts = maxRetries + 1;

    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          lifecycleState = 'validating';
          lifecycleState = 'executing';
          await withTimeout(definition.execute(event.payload as TInput, ctx), timeoutMs);
          lifecycleState = 'acking';
          // noop ack for in-memory; Redis Streams uses XACK (Phase 3)
          lifecycleState = 'idle';
          return;
        } catch (err) {
          if (attempt >= maxAttempts) {
            lifecycleState = 'error';
            console.error(`[${name}] failed after ${attempt} attempt(s)`, err);
          }
        }
      }
    } finally {
      tracer.endSpan(span);
    }
  });

  lifecycleState = 'idle';

  return {
    definition,
    get state() {
      return lifecycleState;
    },
    async stop() {
      unsubscribe();
      lifecycleState = 'idle';
    },
  };
}
