import type Redis from 'ioredis';
import type { EventId, EventType, SimulationId, Timestamp, TraceId } from '../../types';
import type { DomainEvent, EventHandler } from '../../types';

type AnyHandler = EventHandler<unknown>;
type XMessage = [id: string, fields: string[]];

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

async function scanStream(
  redis: Redis,
  streamKey: string,
  start: string,
  end: string,
  filter: (event: DomainEvent) => boolean,
): Promise<DomainEvent[]> {
  const results: DomainEvent[] = [];
  let cursor = start;
  const batchSize = 200;

  while (true) {
    const messages = (await redis.xrange(streamKey, cursor, end, 'COUNT', batchSize)) as XMessage[];

    if (messages.length === 0) break;

    for (const [, fields] of messages) {
      const event = parseMessage(fields);
      if (event !== undefined && filter(event)) results.push(event);
    }

    if (messages.length < batchSize) break;

    const lastId = messages.at(-1)?.[0];
    if (lastId === undefined) break;
    const parts = lastId.split('-');
    const ms = parts[0] ?? '0';
    const seq = Number(parts[1] ?? 0) + 1;
    cursor = `${ms}-${seq}`;
  }

  return results;
}

async function replayEvents(
  events: DomainEvent[],
  typed: Map<EventType, Set<AnyHandler>>,
  global: Set<AnyHandler>,
): Promise<void> {
  const sorted = [...events].sort((a, b) => a.occurredAt - b.occurredAt);
  for (const event of sorted) {
    const handlers = [...(typed.get(event.type) ?? []), ...global];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error('[RedisStreams] replay handler threw', { type: event.type, err });
      }
    }
  }
}

export interface ReplayContext {
  readonly redis: Redis;
  readonly streamKey: string;
  readonly typed: Map<EventType, Set<AnyHandler>>;
  readonly global: Set<AnyHandler>;
}

export async function replayByEventId(ctx: ReplayContext, eventId: EventId): Promise<void> {
  const events = await scanStream(ctx.redis, ctx.streamKey, '-', '+', (e) => e.id === eventId);
  await replayEvents(events, ctx.typed, ctx.global);
}

export async function replayByTraceId(ctx: ReplayContext, traceId: TraceId): Promise<void> {
  const events = await scanStream(
    ctx.redis,
    ctx.streamKey,
    '-',
    '+',
    (e) => e.traceContext.traceId === traceId,
  );
  await replayEvents(events, ctx.typed, ctx.global);
}

export async function replayByTimeRange(
  ctx: ReplayContext,
  _simulationId: SimulationId,
  from?: Timestamp,
  to?: Timestamp,
): Promise<void> {
  const start = from !== undefined ? String(from) : '-';
  const end = to !== undefined ? `${String(to)}-9999999` : '+';
  const events = await scanStream(ctx.redis, ctx.streamKey, start, end, () => true);
  await replayEvents(events, ctx.typed, ctx.global);
}
