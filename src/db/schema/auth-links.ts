import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { createId } from '@paralleldrive/cuid2'

import { users } from './users'

export const authLinks = pgTable('auth_links', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  code: text('code').notNull().unique(),
  userId: text('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const authLinksRelations = relations(authLinks, ({ one }) => {
  return {
    maneger: one(users, {
      fields: [authLinks.userId],
      references: [users.id],
      relationName: 'authLinks',
    }),
  }
})
