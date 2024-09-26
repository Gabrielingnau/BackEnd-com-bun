import Elysia, { t } from 'elysia'
import { auth } from '../../auth'
import { UnauthorizedError } from '../../errors/unauthorized-error'
import { db } from '../../../db/connection'
import { orders } from '../../../db/schema'
import { and, eq } from 'drizzle-orm'

export const approveOrder = new Elysia().use(auth).patch(
  '/orders/:orderId/approve',
  async ({ getCurrentUser, set, params }) => {
    const { orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where(fields, { eq }) {
        return and(
            eq(fields.id, orderId),
            eq(fields.restaurantId, restaurantId),
          )
      },
    })

    if (!order) {
      set.status = 400

      return { message: 'Pedido não encontrado.' }
    }

    if (order.status !== 'pending') {
      set.status = 400

      return { message: 'Você só pode aprovar pedidos pendentes.' }
    }

    await db
      .update(orders)
      .set({ status: 'processing' })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      orderId: t.String(),
    }),
  },
)