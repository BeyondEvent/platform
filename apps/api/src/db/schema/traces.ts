import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const traces = pgTable(
  'traces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    traceId: text('trace_id').notNull().unique(),
    rootSpanId: text('root_span_id').notNull(),
    correlationId: text('correlation_id').notNull(),
    simulationId: uuid('simulation_id'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('traces_trace_id_idx').on(table.traceId),
    index('traces_correlation_id_idx').on(table.correlationId),
    index('traces_simulation_id_idx').on(table.simulationId),
  ],
);
