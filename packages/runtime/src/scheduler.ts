import type { IScheduler } from './interfaces';
import type { ScheduledTask } from './types';

async function runWithRetries(task: ScheduledTask): Promise<void> {
  const maxAttempts = (task.retries ?? 0) + 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await task.handler();
      return;
    } catch (err) {
      if (attempt >= maxAttempts) {
        console.error(`[Scheduler] task "${task.id}" failed after ${attempt} attempt(s)`, err);
      }
    }
  }
}

export function createInMemoryScheduler(): IScheduler {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  return {
    async schedule(task) {
      if (timers.has(task.id)) return;
      const delay = Math.max(0, task.executeAt - Date.now());
      const timer = setTimeout(() => {
        timers.delete(task.id);
        void runWithRetries(task);
      }, delay);
      timers.set(task.id, timer);
    },
    async cancel(taskId) {
      const timer = timers.get(taskId);
      if (timer !== undefined) {
        clearTimeout(timer);
        timers.delete(taskId);
      }
    },
    async shutdown() {
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
    },
  };
}
