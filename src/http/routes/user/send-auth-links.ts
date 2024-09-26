import Elysia, { t } from 'elysia'
import { db } from '../../../db/connection'
import { createId } from '@paralleldrive/cuid2'
import { authLinks } from '../../../db/schema'
import { env } from '../../../env'
import { resend } from '../../../mail/client'
import { AuthenticationMagicLinkTemplate } from '../../../mail/templates/authentication-magic-link'

export const sendAuthLinks = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const userFromEmail = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!userFromEmail) {
      throw new Error('User não encontrado.')
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: userFromEmail.id,
      code: authLinkCode,
    })

    // Enviar um e-mail

    const authLink = new URL(
      '/auth-links/authenticate',
      `${env.API_BASE_URL}${env.PORT}`,
    )

    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirectUrl', env.AUTH_REDIRECT_URL)
    
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: '[Pizza Shop] Link para login',
      react: AuthenticationMagicLinkTemplate({
        userEmail: email,
        authLink: authLink.toString(),
      }),
    })

  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
