import type { DomainEvent } from '@beyondevent/event-bus';
import type { PipelineContext, PipelineMiddlewareFn, ScheduledTask } from './types';

export interface ILifecycle {
  onStart(fn: () => Promise<void>): void;
  onStop(fn: () => Promise<void>): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  readonly isRunning: boolean;
}

export interface IScheduler {
  schedule(task: ScheduledTask): Promise<void>;
  cancel(taskId: string): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IPipelineMiddleware<TEvent = DomainEvent> {
  readonly name: string;
  execute: PipelineMiddlewareFn<TEvent>;
}

export interface IPipeline<TIn = DomainEvent, TOut = DomainEvent> {
  use(middleware: IPipelineMiddleware<TIn>): this;
  execute(input: TIn, ctx: PipelineContext): Promise<TOut>;
}
