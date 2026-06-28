import type { WorkerDefinition } from './interfaces';

/**
 * Type-safe identity wrapper for worker definitions.
 * For a full runtime (subscriptions, retries, lifecycle), use createWorkerRuntime().
 */
export function createWorker<TInput, TOutput>(
  definition: WorkerDefinition<TInput, TOutput>,
): WorkerDefinition<TInput, TOutput> {
  return definition;
}
