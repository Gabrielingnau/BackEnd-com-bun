import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'

import { createId } from '@paralleldrive/cuid2'

import { restaurants } from '.'

export const promos = pgTable('promo', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  avatar: varchar('avatar').notNull(),
  name: text('name').notNull(),
  restaurantId: text('restaurant_id').references(() => restaurants.id, {
    onDelete: 'cascade',
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const promoRelations = relations(promos, ({ one }) => {
  return {
    product: one(restaurants, {
      fields: [promos.restaurantId],
      references: [restaurants.id],
      relationName: 'promo_restaurant',
    }),
  }
})