import { randomBytes } from 'node:crypto';

export function generateId(): string {
  const ms = Date.now();
  const buf = randomBytes(16);

  // 48-bit Unix timestamp (big-endian, bytes 0-5)
  const msHi = Math.floor(ms / 0x100000000);
  const msLo = ms % 0x100000000;
  buf[0] = (msHi >>> 8) & 0xff;
  buf[1] = msHi & 0xff;
  buf[2] = (msLo >>> 24) & 0xff;
  buf[3] = (msLo >>> 16) & 0xff;
  buf[4] = (msLo >>> 8) & 0xff;
  buf[5] = msLo & 0xff;

  // Version 7
  const b6 = buf[6];
  if (b6 !== undefined) {
    buf[6] = (b6 & 0x0f) | 0x70;
  }

  // Variant 10xx xxxx (RFC 4122)
  const b8 = buf[8];
  if (b8 !== undefined) {
    buf[8] = (b8 & 0x3f) | 0x80;
  }

  const h = buf.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
