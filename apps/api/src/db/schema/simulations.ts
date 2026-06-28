import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const simulationStatusEnum = pgEnum('simulation_status', [
  'pending',
  'running',
  'paused',
  'completed',
  'failed',
]);

export const simulations = pgTable(
  'simulations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    status: simulationStatusEnum('status').notNull().default('pending'),
    topologyId: uuid('topology_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('simulations_status_idx').on(table.status),
    index('simulations_topology_id_idx').on(table.topologyId),
  ],
);
