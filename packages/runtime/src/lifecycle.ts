import type { ILifecycle } from './interfaces';

export function createLifecycle(): ILifecycle {
  const startHooks: Array<() => Promise<void>> = [];
  const stopHooks: Array<() => Promise<void>> = [];
  let running = false;

  return {
    get isRunning() {
      return running;
    },
    onStart(fn) {
      startHooks.push(fn);
    },
    onStop(fn) {
      stopHooks.push(fn);
    },
    async start() {
      if (running) return;
      for (const fn of startHooks) await fn();
      running = true;
    },
    async stop() {
      if (!running) return;
      // Mark stopped before running hooks so re-entrant calls bail early.
      running = false;
      const errors: unknown[] = [];
      // LIFO — teardown in reverse registration order.
      for (const fn of [...stopHooks].reverse()) {
        try {
          await fn();
        } catch (err) {
          errors.push(err);
        }
      }
      if (errors.length > 0) throw errors[0];
    },
  };
}
