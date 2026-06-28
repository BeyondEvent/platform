import { and, eq, gt, lt, or } from 'drizzle-orm';

export interface CursorPayload {
  timestamp: string;
  id: string;
}

/**
 * Encodes a timestamp and unique ID into a base64 cursor string.
 */
export function encodeCursor(timestamp: Date, id: string): string {
  const payload: CursorPayload = {
    timestamp: timestamp.toISOString(),
    id,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Decodes a base64 cursor string back to a timestamp and unique ID.
 */
export function decodeCursor(cursorStr: string): CursorPayload | null {
  try {
    const raw = Buffer.from(cursorStr, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw) as CursorPayload;
    if (parsed && typeof parsed === 'object' && parsed.timestamp && parsed.id) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Builds the Drizzle condition for pagination on (timestamp, id).
 * Order can be 'asc' or 'desc'.
 */
export function getCursorCondition(
  // biome-ignore lint/suspicious/noExplicitAny: Drizzle columns can represent any datatype expression
  columnTimestamp: any,
  // biome-ignore lint/suspicious/noExplicitAny: Drizzle columns can represent any datatype expression
  columnId: any,
  cursorPayload: CursorPayload,
  order: 'asc' | 'desc',
) {
  const cursorDate = new Date(cursorPayload.timestamp);

  if (order === 'desc') {
    return or(
      lt(columnTimestamp, cursorDate),
      and(eq(columnTimestamp, cursorDate), lt(columnId, cursorPayload.id)),
    );
  }
  return or(
    gt(columnTimestamp, cursorDate),
    and(eq(columnTimestamp, cursorDate), gt(columnId, cursorPayload.id)),
  );
}
