import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index';

export type DbClient = ReturnType<typeof createDbClient>;

export function createDbClient(url: string) {
  return drizzle(url, { schema });
}
