import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    traceId: text('trace_id').notNull(),
    spanId: text('span_id').notNull(),
    correlationId: text('correlation_id').notNull(),
    causationId: text('causation_id'),
    simulationId: uuid('simulation_id'),
    version: integer('version').notNull().default(1),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('events_trace_id_idx').on(table.traceId),
    index('events_correlation_id_idx').on(table.correlationId),
    index('events_simulation_id_idx').on(table.simulationId),
    index('events_type_idx').on(table.type),
    index('events_occurred_at_idx').on(table.occurredAt),
  ],
);
