import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { createId } from '@paralleldrive/cuid2'

import { restaurants } from '.'

export const categorys = pgTable('category', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  category: text('category').notNull(),
  restaurantId: text('restaurant_id').references(() => restaurants.id, {
    onDelete: 'cascade',
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const categoryRelations = relations(categorys, ({ one }) => {
  return {
    product: one(restaurants, {
      fields: [categorys.restaurantId],
      references: [restaurants.id],
      relationName: 'category_products',
    }),
  }
})