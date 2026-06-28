import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const workerStateEnum = pgEnum('worker_state', [
  'idle',
  'subscribing',
  'receiving',
  'validating',
  'executing',
  'publishing',
  'acking',
  'error',
]);

export const workers = pgTable('workers', {
  id: uuid('id').primaryKey().defaultRandom(),
  workerId: text('worker_id').notNull().unique(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  state: workerStateEnum('state').notNull().default('idle'),
  tags: text('tags').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
