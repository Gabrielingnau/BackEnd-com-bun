import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { createId } from '@paralleldrive/cuid2'

import { restaurants, users } from '.'

export const FuncionaryRoleEnum = pgEnum('funcionary_role', ['manager', 'deliveryman', 'customer'])

export const funcionarys = pgTable('funcionary', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  role: FuncionaryRoleEnum('rore').notNull(),
  userId: text('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }).notNull(),
  restaurantId: text('restaurant_id').references(() => restaurants.id, {
    onDelete: 'cascade',
  }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const funcionaryRelations = relations(funcionarys, ({ one }) => {
  return {
    product: one(restaurants, {
      fields: [funcionarys.restaurantId],
      references: [restaurants.id],
      relationName: 'funcionary_restaurant',
    }),
    funcionary: one(users, {
      fields: [funcionarys.userId],
      references: [users.id],
      relationName: 'funcionary',
    }),
  }
})