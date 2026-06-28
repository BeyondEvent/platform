import type Redis from 'ioredis';
import type { EventId, SimulationId, Timestamp } from '../../types';
import type { DomainEvent, EventHandler, EventType } from '../../types';

type AnyHandler = EventHandler<unknown>;

export interface HandlerRegistry {
  readonly typed: Map<EventType, Set<AnyHandler>>;
  readonly global: Set<AnyHandler>;
}

export interface ConsumerConfig {
  readonly streamKey: string;
  readonly dlqKey: string;
  readonly groupName: string;
  readonly consumerName: string;
  readonly blockMs: number;
  readonly batchSize: number;
  readonly maxRetries: number;
}

// XReadGroup result shape from ioredis v5
type XMessage = [id: string, fields: string[]];
type XReadGroupResult = Array<[key: string, messages: XMessage[]]> | null;

function parseMessage(fields: string[]): DomainEvent | undefined {
  const f: Record<string, string> = {};
  for (let i = 0; i + 1 < fields.length; i += 2) {
    const k = fields[i];
    const v = fields[i + 1];
    if (k !== undefined && v !== undefined) f[k] = v;
  }
  if (!f.id || !f.type || !f.payload || !f.traceContext || !f.occurredAt || !f.version) {
    return undefined;
  }
  return {
    id: f.id as EventId,
    type: f.type as EventType,
    payload: JSON.parse(f.payload) as unknown,
    traceContext: JSON.parse(f.traceContext) as DomainEvent['traceContext'],
    occurredAt: Number(f.occurredAt) as Timestamp,
    version: Number(f.version),
    simulationId: f.simulationId as SimulationId | undefined,
  };
}

async function withBackoff(fn: () => Promise<void>, maxRetries: number): Promise<void> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await fn();
      return;
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      await new Promise<void>((r) => setTimeout(r, 50 * 2 ** attempt));
    }
  }
}

async function dispatch(
  event: DomainEvent,
  registry: HandlerRegistry,
  maxRetries: number,
  onFailed: (event: DomainEvent, err: unknown) => Promise<void>,
): Promise<boolean> {
  const typed = registry.typed.get(event.type);
  const all = [...(typed ?? []), ...registry.global];
  let allOk = true;
  for (const handler of all) {
    try {
      await withBackoff(() => handler(event), maxRetries);
    } catch (err) {
      allOk = false;
      await onFailed(event, err);
    }
  }
  return allOk;
}

async function sendToDlq(
  redis: Redis,
  dlqKey: string,
  event: DomainEvent,
  msgId: string,
  err: unknown,
): Promise<void> {
  try {
    await redis.xadd(
      dlqKey,
      'MAXLEN',
      '~',
      10_000,
      '*',
      'originalMsgId',
      msgId,
      'eventId',
      event.id,
      'eventType',
      event.type,
      'error',
      String(err),
      'failedAt',
      String(Date.now()),
    );
  } catch {
    console.error('[RedisStreams] failed to write to DLQ', { msgId, eventType: event.type });
  }
}

export async function createConsumerGroup(
  redis: Redis,
  streamKey: string,
  groupName: string,
): Promise<void> {
  try {
    // $ = only new messages; MKSTREAM creates stream if it doesn't exist
    await redis.xgroup('CREATE', streamKey, groupName, '$', 'MKSTREAM');
  } catch (err) {
    // BUSYGROUP means group already exists — safe to ignore
    if (String(err).includes('BUSYGROUP')) return;
    throw err;
  }
}

export async function claimPending(
  redis: Redis,
  streamKey: string,
  groupName: string,
  consumerName: string,
): Promise<DomainEvent[]> {
  // Reclaim messages idle for >5 minutes from crashed consumers
  const result = (await redis.xautoclaim(
    streamKey,
    groupName,
    consumerName,
    String(5 * 60 * 1_000),
    '0-0',
    'COUNT',
    '100',
  )) as [nextId: string, messages: XMessage[]];

  const messages = result[1] ?? [];
  return messages.flatMap(([, fields]) => {
    const event = parseMessage(fields);
    return event !== undefined ? [event] : [];
  });
}

export function startConsumerLoop(
  subscriberRedis: Redis,
  publisherRedis: Redis,
  cfg: ConsumerConfig,
  registry: HandlerRegistry,
): () => Promise<void> {
  let stopped = false;
  let resolveLoop!: () => void;
  const loopDone = new Promise<void>((r) => {
    resolveLoop = r;
  });

  const loop = async (): Promise<void> => {
    while (!stopped) {
      try {
        const result = (await subscriberRedis.xreadgroup(
          'GROUP',
          cfg.groupName,
          cfg.consumerName,
          'COUNT',
          cfg.batchSize,
          'BLOCK',
          cfg.blockMs,
          'STREAMS',
          cfg.streamKey,
          '>',
        )) as XReadGroupResult;

        if (result === null) continue;

        for (const [, messages] of result) {
          for (const [msgId, fields] of messages) {
            const event = parseMessage(fields);
            if (event === undefined) {
              // Malformed — ack and skip rather than letting it block the group
              await subscriberRedis.xack(cfg.streamKey, cfg.groupName, msgId);
              continue;
            }

            await dispatch(event, registry, cfg.maxRetries, (e, err) =>
              sendToDlq(publisherRedis, cfg.dlqKey, e, msgId, err),
            );

            // Always ack: failures are recorded in the DLQ, not re-queued indefinitely
            await subscriberRedis.xack(cfg.streamKey, cfg.groupName, msgId);
          }
        }
      } catch (err) {
        if (stopped) break;
        console.error('[RedisStreams] consumer loop error — retrying in 1s', err);
        await new Promise<void>((r) => setTimeout(r, 1_000));
      }
    }
    resolveLoop();
  };

  void loop();

  return async () => {
    stopped = true;
    await loopDone;
  };
}
