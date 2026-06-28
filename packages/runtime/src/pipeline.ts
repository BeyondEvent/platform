import type { DomainEvent } from '@beyondevent/event-bus';
import type { IPipeline, IPipelineMiddleware } from './interfaces';
import type { PipelineContext } from './types';

export function createPipeline<TIn = DomainEvent, TOut = DomainEvent>(): IPipeline<TIn, TOut> {
  const middlewares: IPipelineMiddleware<TIn>[] = [];

  return {
    use(middleware) {
      middlewares.push(middleware);
      return this;
    },
    async execute(input, ctx: PipelineContext) {
      let index = 0;
      // Each execute() call gets its own index — safe for concurrent calls.
      const dispatch = async (): Promise<void> => {
        const mw = middlewares[index++];
        if (mw === undefined) return;
        await mw.execute(input, ctx, dispatch);
      };
      await dispatch();
      return input as unknown as TOut;
    },
  };
}
