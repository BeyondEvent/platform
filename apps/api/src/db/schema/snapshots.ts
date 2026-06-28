import { index, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const snapshots = pgTable(
  'snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    simulationId: uuid('simulation_id').notNull(),
    data: jsonb('data').notNull(),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('snapshots_simulation_id_idx').on(table.simulationId),
    index('snapshots_captured_at_idx').on(table.capturedAt),
  ],
);
