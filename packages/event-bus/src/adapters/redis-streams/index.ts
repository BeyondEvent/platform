import { hostname } from 'node:os';
import type { IReplayableEventBusAdapter } from '../../interfaces';
import type {
  DomainEvent,
  EventHandler,
  EventId,
  EventType,
  SimulationId,
  Timestamp,
  TraceId,
  Unsubscribe,
} from '../../types';
import { createRedisConnection } from './connection';
import { claimPending, createConsumerGroup, startConsumerLoop } from './consumer';
import type { HandlerRegistry } from './consumer';
import { publishToStream } from './publisher';
import { replayByEventId, replayByTimeRange, replayByTraceId } from './replay';
import type { ReplayContext } from './replay';

export interface RedisStreamsConfig {
  readonly url: string;
  /** Stream key for all domain events. Default: `beyond:events` */
  readonly streamKey?: string;
  /** Dead-letter queue stream key. Default: `beyond:dlq` */
  readonly dlqKey?: string;
  /** Consumer group name. Default: `beyondevent` */
  readonly groupName?: string;
  /** Consumer name — unique per process. Default: `os.hostname()` */
  readonly consumerName?: string;
  /** XREADGROUP BLOCK timeout ms. Default: 2000 */
  readonly blockMs?: number;
  /** Messages per XREADGROUP poll. Default: 10 */
  readonly batchSize?: number;
  /** Approximate MAXLEN for stream trimming. Default: 100_000 */
  readonly maxStreamLength?: number;
  /** Max handler retry attempts before DLQ. Default: 3 */
  readonly maxRetries?: number;
}

type AnyHandler = EventHandler<unknown>;

export function createRedisStreamsAdapter(cfg: RedisStreamsConfig): IReplayableEventBusAdapter {
  const streamKey = cfg.streamKey ?? 'beyond:events';
  const dlqKey = cfg.dlqKey ?? 'beyond:dlq';
  const groupName = cfg.groupName ?? 'beyondevent';
  const consumerName = cfg.consumerName ?? hostname();
  const blockMs = cfg.blockMs ?? 2_000;
  const batchSize = cfg.batchSize ?? 10;
  const maxStreamLength = cfg.maxStreamLength ?? 100_000;
  const maxRetries = cfg.maxRetries ?? 3;

  const publisher = createRedisConnection(cfg.url);
  const subscriber = createRedisConnection(cfg.url);

  const registry: HandlerRegistry = {
    typed: new Map<EventType, Set<AnyHandler>>(),
    global: new Set<AnyHandler>(),
  };

  let connected = false;
  let stopLoop: (() => Promise<void>) | undefined;

  function addHandler(type: EventType, handler: AnyHandler): Unsubscribe {
    let set = registry.typed.get(type);
    if (set === undefined) {
      set = new Set<AnyHandler>();
      registry.typed.set(type, set);
    }
    set.add(handler);
    return () => set.delete(handler);
  }

  const replayCtx = (): ReplayContext => ({
    redis: publisher,
    streamKey,
    typed: registry.typed,
    global: registry.global,
  });

  return {
    get isConnected() {
      return connected;
    },

    async connect(): Promise<void> {
      if (connected) return;
      await publisher.connect();
      await subscriber.connect();

      await createConsumerGroup(subscriber, streamKey, groupName);

      // Recover messages left pending by a previously crashed instance
      const pending = await claimPending(subscriber, streamKey, groupName, consumerName);
      for (const event of pending) {
        const all = [...(registry.typed.get(event.type) ?? []), ...registry.global];
        for (const h of all) {
          try {
            await h(event);
          } catch {
            // best-effort for recovered messages
          }
        }
      }

      stopLoop = startConsumerLoop(
        subscriber,
        publisher,
        { streamKey, dlqKey, groupName, consumerName, blockMs, batchSize, maxRetries },
        registry,
      );

      connected = true;
    },

    async disconnect(): Promise<void> {
      if (!connected) return;
      connected = false;
      if (stopLoop !== undefined) await stopLoop();
      registry.typed.clear();
      registry.global.clear();
      await subscriber.quit();
      await publisher.quit();
    },

    async publish<TPayload>(event: DomainEvent<TPayload>): Promise<void> {
      await publishToStream(publisher, streamKey, maxStreamLength, event as DomainEvent);
    },

    subscribe<TPayload>(type: EventType, handler: EventHandler<TPayload>): Unsubscribe {
      return addHandler(type, handler as AnyHandler);
    },

    subscribeMany<TPayload>(types: EventType[], handler: EventHandler<TPayload>): Unsubscribe {
      const unsubs = types.map((t) => addHandler(t, handler as AnyHandler));
      return () => {
        for (const u of unsubs) u();
      };
    },

    subscribeAll(handler: AnyHandler): Unsubscribe {
      registry.global.add(handler);
      return () => registry.global.delete(handler);
    },

    async replayEvent(eventId: EventId): Promise<void> {
      await replayByEventId(replayCtx(), eventId);
    },

    async replayTrace(traceId: TraceId): Promise<void> {
      await replayByTraceId(replayCtx(), traceId);
    },

    async replaySimulation(
      simulationId: SimulationId,
      from?: Timestamp,
      to?: Timestamp,
    ): Promise<void> {
      await replayByTimeRange(replayCtx(), simulationId, from, to);
    },
  };
}
