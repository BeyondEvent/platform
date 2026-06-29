import { MetricNames } from '@beyondevent/metrics';
import type { IMetricsRegistry } from '@beyondevent/metrics';
import type { ITracer } from '@beyondevent/tracing';
import type { IPipelineMiddleware } from './interfaces';

/** Validator returns an empty array on success or a list of error strings on failure. */
export type PayloadValidator = (payload: unknown) => readonly string[];

export function createValidationMiddleware(
  validators: Readonly<Record<string, PayloadValidator>> = {},
): IPipelineMiddleware {
  return {
    name: 'validation',
    async execute(event, _ctx, next) {
      const validate = validators[event.type];
      if (validate !== undefined) {
        const errors = validate(event.payload);
        if (errors.length > 0) {
          const { ValidationError } = await import('@beyondevent/shared');
          throw new ValidationError(
            `Invalid payload for event type "${event.type}": ${errors.join(', ')}`,
          );
        }
      }
      await next();
    },
  };
}

export function createTracingMiddleware(tracer: ITracer): IPipelineMiddleware {
  return {
    name: 'tracing',
    async execute(event, _ctx, next) {
      const span = tracer.startSpan(event.type, event.traceContext);
      try {
        await next();
      } finally {
        tracer.endSpan(span);
      }
    },
  };
}

export function createMetricsMiddleware(registry: IMetricsRegistry): IPipelineMiddleware {
  // Resolve instruments once at factory time — creating them per-event causes metric duplication.
  const throughput = registry.counter(
    MetricNames.EVENT_THROUGHPUT,
    'Events processed successfully',
  );
  const errors = registry.counter(MetricNames.EVENT_ERRORS, 'Events failed in pipeline');
  const latency = registry.histogram(
    MetricNames.EVENT_LATENCY,
    'Pipeline latency ms',
    [5, 10, 25, 50, 100, 250, 500, 1000],
  );
  const timer = registry.timer('beyondevent.pipeline.duration', 'Pipeline execution duration');

  return {
    name: 'metrics',
    async execute(event, ctx, next) {
      const labels = { event_type: event.type, simulation_id: ctx.simulationId };
      const stop = timer.start();
      let failed = false;
      try {
        await next();
      } catch (err) {
        failed = true;
        throw err;
      } finally {
        const duration = stop();
        latency.observe(duration, labels);
        (failed ? errors : throughput).increment(labels);
      }
    },
  };
}
