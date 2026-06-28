import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const topologies = pgTable('topologies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  snapshot: jsonb('snapshot').notNull().default({ nodes: [], edges: [] }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
