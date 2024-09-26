import Elysia, { t } from 'elysia'
import { db } from '../../../db/connection'
import { auth } from '../../auth'
import dayjs from 'dayjs'
import { authLinks } from '../../../db/schema'
import { eq } from 'drizzle-orm'

export const authenticateFromLink = new Elysia().use(auth).get(
  '/auth-links/authenticate',
  async ({ query, redirect, signUser }) => {
    const { code, redirectUrl } = query

    const authLinkFromCode = await db.query.authLinks.findFirst({
      where(fields, { eq }) {
        return eq(fields.code, code)
      },
    })

    if (!authLinkFromCode) {
      throw new Error('link de autenticação não encontrado')
    }

    const daysSinceAuthLinkWasCreated = dayjs().diff(
      authLinkFromCode.createdAt,
      'days',
    )

    if (daysSinceAuthLinkWasCreated > 7) {
      throw new Error('O link de autenticação expirou, gere um novo.')
    }

    const managedRestaurante = await db.query.restaurants.findFirst({
      where(fields, { eq }) {
        return eq(fields.managerId, authLinkFromCode.userId)
      },
    })

    signUser({
      sub: authLinkFromCode.userId,
      restaurantId: managedRestaurante?.id,
    })

    await db.delete(authLinks).where(eq(authLinks.code, code))

    return redirect(redirectUrl)
  },
  {
    query: t.Object({
      code: t.String(),
      redirectUrl: t.String(),
    }),
  },
)