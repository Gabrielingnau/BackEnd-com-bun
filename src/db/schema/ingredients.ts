import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { createId } from '@paralleldrive/cuid2'

import { products } from '.'

export const ingredients = pgTable('ingredients', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name').notNull(),
  productId: text('product_id').references(() => products.id, {
    onDelete: 'cascade',
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const ingredientsRelations = relations(ingredients, ({ one }) => {
  return {
    product: one(products, {
      fields: [ingredients.productId],
      references: [products.id],
      relationName: 'ingredients',
    }),
  }
})