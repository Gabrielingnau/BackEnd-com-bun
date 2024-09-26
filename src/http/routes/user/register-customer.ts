import { users } from '../../../db/schema'
import { db } from '../../../db/connection'
import Elysia from 'elysia'
import { z } from 'zod'

const registerCustomerBodySchema = z.object({
  name: z.string().min(1),
  phone: z.string(),
  email: z.string().email(),
})

export const registerCustomer = new Elysia().post(
  '/customers',
  async ({ body, set }) => {
    const { name, phone, email } = registerCustomerBodySchema.parse(body)

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (user) {
      return set.status = 204
    }

    await db.insert(users).values({
      name,
      email,
      phone,
    })

    return set.status = 204
  },
)