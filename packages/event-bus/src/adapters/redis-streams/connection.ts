import Redis from 'ioredis';

export function createRedisConnection(url: string): Redis {
  return new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    // Give up after 3 attempts (~900 ms total) so bootstrap can fall back to in-memory
    // if Redis is not running. Ongoing reconnects after a live-connection drop follow the
    // same strategy — acceptable for a dev/staging setup.
    retryStrategy: (times) => (times > 2 ? null : times * 300),
  });
}
