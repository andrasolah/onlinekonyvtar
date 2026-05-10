import { pgTable, serial, varchar, boolean, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  isbn: varchar('isbn', { length: 20 }).unique(),
  available: boolean('available').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const loans = pgTable('loans', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  bookId: integer('book_id').references(() => books.id),
  loanedAt: timestamp('loaned_at').defaultNow(),
  dueDate: timestamp('due_date').notNull(),
  returnedAt: timestamp('returned_at')
});