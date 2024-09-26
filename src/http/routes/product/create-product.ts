import Elysia, { t } from 'elysia'

import { db } from '../../../db/connection'
import { products } from '../../../db/schema'
import { auth } from '../../auth'

export const createProduct = new Elysia().use(auth).post(
  '/product',
  async ({ body, set, getCurrentUser }) => {
    const { avatar, name, description, priceInCents, category } = body
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new Error('O usuário não é um gerente.')
    }

    await db
      .insert(products)
      .values({
        name,
        description,
        restaurantId,
        priceInCents,
        avatar,
        category
      })

    set.status = 204
  },
  {
    body: t.Object({
      avatar: t.String(),
      name: t.String(),
      description: t.String(),
      priceInCents: t.Integer(),
      category: t.String(),
    }),
  },
)