import { Elysia, t, type Static } from 'elysia'
import jwt from '@elysiajs/jwt'

import { env } from '../env'
import { UnauthorizedError } from './errors/unauthorized-error'
import { NotAManagerError } from './errors/not-a-manager-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = new Elysia()
.error({
  UNAUTHORIZED: UnauthorizedError,
})
.onError(({ error, code, set }) => {
  switch (code) {
    case 'UNAUTHORIZED': {
      set.status = 401
      return {
        code,
        message: error.message,
      }
    }
    case 'NOT_FOUND': {
      return new Response(null, { status: 404 })
    }
  }
})
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload
    }),
  )
  .derive({ as: 'scoped' }, ({ jwt, cookie: { auth } }) => {
    return {
      signUser: async (payload: Static<typeof jwtPayload>) => {
        const token = await jwt.sign(payload)

        auth.value = token
        auth.httpOnly = true
        auth.maxAge = 60 * 60 * 24 * 7 // 7 days
        auth.path = '/'
      },

      getCurrentUser: async () => {
        const payload = await jwt.verify(auth.value)

        if (!payload) {
          throw new Error('Unauthorized.')
        }

        return {
          userId: payload.sub,
          restaurantId: payload.restaurantId,
        }
      },

      getManagedRestaurantId: async () => {
        const payload = await jwt.verify(auth.value)

        if (!payload) {
          throw new Error('Unauthorized.')
        }

        if (!payload.restaurantId) {
          throw new NotAManagerError()
        }

        return payload.restaurantId
      },

      signOut: async () => {
        auth.remove()
      },
    }
  })
  .derive(({ getCurrentUser }) => {
    return {
      getManagedRestaurantId: async () => {
        const { restaurantId } = await getCurrentUser()

        if (!restaurantId) {
          throw new NotAManagerError()
        }

        return restaurantId
      },
    }
  })