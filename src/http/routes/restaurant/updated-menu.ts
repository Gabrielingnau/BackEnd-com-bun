import Elysia, { type Static, t } from 'elysia'
import { auth } from '../../auth'
import { db } from '../../../db/connection'
import { products } from '../../../db/schema'
import { and, eq, inArray } from 'drizzle-orm'

const productSchema = t.Object({
  avatar: t.String(),
  id: t.Optional(t.String()),
  name: t.String(),
  description: t.Optional(t.String()),
  price: t.Number({ minimum: 0 }),
  category: t.String(),
})

export const updateMenu = new Elysia().use(auth).put(
  '/menu',
  async ({ getManagedRestaurantId, set, body }) => {
    const restaurantId = await getManagedRestaurantId()

    const {
      products: { deletedProductIds, newOrUpdatedProducts },
    } = body

    if (deletedProductIds.length > 0) {
      await db
        .delete(products)
        .where(
          and(
            inArray(products.id, deletedProductIds),
            eq(products.restaurantId, restaurantId),
          ),
        )
    }

    type Product = Static<typeof productSchema>
    type ProductWithId = Required<Product>
    type ProductWithoutId = Omit<Product, 'id'>

    const updatedProducts = newOrUpdatedProducts.filter(
      (product): product is ProductWithId => {
        return !!product.id
      },
    )

    if (updatedProducts.length > 0) {
      await Promise.all(
        updatedProducts.map((product) => {
          return db
            .update(products)
            .set({
              avatar: product.avatar,
              name: product.name,
              description: product.description,
              priceInCents: product.price * 100,
              category: product.category
            })
            .where(
              and(
                eq(products.id, product.id),
                eq(products.restaurantId, restaurantId),
              ),
            )
        }),
      )
    }

    const newProducts = newOrUpdatedProducts.filter(
      (product): product is ProductWithoutId => {
        return !product.id
      },
    )

    if (newProducts.length) {
      await db.insert(products).values(
        newProducts.map((product) => {
          return {
            avatar: product.avatar,
            name: product.name,
            description: product.description,
            priceInCents: product.price * 100,
            restaurantId,
            category: product.category
          }
        }),
      )
    }

    set.status = 204
  },
  {
    body: t.Object({
      products: t.Object({
        newOrUpdatedProducts: t.Array(productSchema),
        deletedProductIds: t.Array(t.String()),
      }),
    }),
  },
)