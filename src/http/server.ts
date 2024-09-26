import { Elysia } from 'elysia'

import { cors } from '@elysiajs/cors'

import { approveOrder } from './routes/order/approve-order'
import { cancelOrder } from './routes/order/cancel-order'
import { createOrder } from './routes/order/create-order'
import { deliverOrder } from './routes/order/deliver-order'
import { dispatchOrder } from './routes/order/dispatch-order'
import { getOrderDetails } from './routes/order/get-order-details'
import { getOrders } from './routes/order/get-orders'
import { getDailyReceiptInPeriod } from './routes/restaurant/get-daily-receipt-in-period'
import { getDayOrdersAmount } from './routes/restaurant/get-day-orders-amount'
import { getManagedRestaurant } from './routes/restaurant/get-managed-restaurant'
import { getMonthCanceledOrdersAmount } from './routes/restaurant/get-month-canceled-orders-amount'
import { getMonthOrdersAmount } from './routes/restaurant/get-month-orders-amount'
import { getMonthReceipt } from './routes/restaurant/get-month.receipt'
import { getPopularProducts } from './routes/product/get-popular-products'
import { registerRestaurant } from './routes/restaurant/register-restaurant'
import { updateRestaurant } from './routes/restaurant/update-restaurant'
import { updateMenu } from './routes/restaurant/updated-menu'
import { authenticateFromLink } from './routes/user/authenticate-from-link'
import { getProfile } from './routes/user/get-profile'
import { registerCustomer } from './routes/user/register-customer'
import { sendAuthLinks } from './routes/user/send-auth-links'
import { signOut } from './routes/sign-out'
import { env } from '../env'
import { auth } from './auth'

const app = new Elysia()
.use(
  cors({
    credentials: true,
    allowedHeaders: ['content-type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    origin: (request): boolean => {
      const origin = request.headers.get('origin')

      if (!origin) {
        return false
      }

      return true
    },
  }),
)
  .use(auth)
  .use(signOut)
  .use(getProfile)
  .use(getManagedRestaurant)
  .use(registerRestaurant)
  .use(registerCustomer)
  .use(sendAuthLinks)
  .use(authenticateFromLink)
  .use(createOrder)
  .use(approveOrder)
  .use(cancelOrder)
  .use(dispatchOrder)
  .use(deliverOrder)
  .use(getOrders)
  .use(getOrderDetails)
  .use(updateMenu)
  .use(updateRestaurant)
  .use(getMonthReceipt)
  .use(getMonthOrdersAmount)
  .use(getDayOrdersAmount)
  .use(getMonthCanceledOrdersAmount)
  .use(getDailyReceiptInPeriod)
  .use(getPopularProducts)
.onError(({ code, error, set }) => {
  switch (code) {
    case 'VALIDATION': {
      set.status = error.status

      return error.toResponse()
    }
    default: {
      console.error(error)

      return new Response(null, { status: 500 })
    }
  }
})

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`)
})
