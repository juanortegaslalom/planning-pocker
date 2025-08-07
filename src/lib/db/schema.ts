import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull().unique(),
  ticketName: text('ticket_name'),
  ticketNumber: text('ticket_number'),
  status: text('status').notNull().default('active'), // 'active', 'revealed', 'ended'
  createdAt: real('created_at').notNull().$defaultFn(() => Date.now()),
  createdBy: text('created_by').notNull(),
});

export const participants = sqliteTable('participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull().references(() => sessions.sessionId, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  displayName: text('display_name').notNull(),
  vote: integer('vote'),
  hasVoted: integer('has_voted', { mode: 'boolean' }).notNull().default(false),
  joinedAt: real('joined_at').notNull().$defaultFn(() => Date.now()),
});