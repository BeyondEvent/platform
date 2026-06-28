import { index, jsonb, pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const metrics = pgTable(
  'metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    value: real('value').notNull(),
    labels: jsonb('labels').notNull().default({}),
    simulationId: uuid('simulation_id'),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('metrics_name_idx').on(table.name),
    index('metrics_simulation_id_idx').on(table.simulationId),
    index('metrics_recorded_at_idx').on(table.recordedAt),
  ],
);
