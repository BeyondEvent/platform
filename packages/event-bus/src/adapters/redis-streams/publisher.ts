import type Redis from 'ioredis';
import type { DomainEvent } from '../../types';

export async function publishToStream(
  redis: Redis,
  streamKey: string,
  maxLen: number,
  event: DomainEvent,
): Promise<void> {
  const fields: string[] = [
    'id',
    event.id,
    'type',
    event.type,
    'payload',
    JSON.stringify(event.payload),
    'traceContext',
    JSON.stringify(event.traceContext),
    'occurredAt',
    String(event.occurredAt),
    'version',
    String(event.version),
  ];
  if (event.simulationId !== undefined) {
    fields.push('simulationId', event.simulationId);
  }
  await redis.xadd(streamKey, 'MAXLEN', '~', maxLen, '*', ...fields);
}
