import chalk from 'chalk'

import { faker } from '@faker-js/faker'

import { db } from './connection'
import { authLinks, ingredients, orderItems, orders, products, restaurants, users } from './schema'
import { createId } from '@paralleldrive/cuid2'

// Reset database
await db.delete(users)
await db.delete(restaurants)
await db.delete(orderItems)
await db.delete(orders)
await db.delete(products)
await db.delete(authLinks)

console.log(chalk.yellow('Database reset!'))

// Create customers
const [customer1, customer2] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()

console.log(chalk.yellow('Created customers!'))

// Create maneger
const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager',
    },
  ])
  .returning({
    id: users.id,
  })

console.log(chalk.yellow('Created maneger!'))

// Create restaurant
const [restaurant] = await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()

console.log(chalk.yellow('Created restaurant!'))

function generateProduct() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    restaurantId: restaurant.id,
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
    avatar: faker.image.avatar(),
    category: faker.commerce.department(),
  }
}

/**
 * Create products
 */

const availableProducts = await db
  .insert(products)
  .values({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    restaurantId: restaurant.id,
    priceInCents: Number(faker.commerce.price({ min: 190, max: 490, dec: 0 })),
    avatar: faker.image.avatar(),
    category: faker.commerce.department(),
  })
  .returning()

console.log(chalk.yellowBright('✔️ Created products!'))

/**
 * Create orders
 */
type IngredietInsert = typeof ingredients.$inferInsert
type OrderItemInsert = typeof orderItems.$inferInsert
type OrderInsert = typeof orders.$inferInsert

const IngredientsToInsert: IngredietInsert[] = []
const orderItemsToInsert: OrderItemInsert[] = []
const ordersToInsert: OrderInsert[] = []

for (let i = 0; i < 200; i++) {
  const orderId = createId()

  const orderProducts = faker.helpers.arrayElements(availableProducts, {
    min: 1,
    max: 3,
  })

  let totalInCents = 0

  orderProducts.forEach((orderProduct) => {
    
    for (let i = 0; i < 5; i++) {
      IngredientsToInsert.push({
        name: faker.commerce.productName(),
        productId: orderProduct.id
      })
    }

    const quantity = faker.number.int({ min: 1, max: 3 })

    totalInCents += orderProduct.priceInCents * quantity

    orderItemsToInsert.push({
      orderId,
      productId: orderProduct.id,
      priceInCents: orderProduct.priceInCents,
      quantity,
    })
  })

  ordersToInsert.push({
    id: orderId,
    customerId: faker.helpers.arrayElement([customer1.id, customer2.id]),
    restaurantId: restaurant.id,
    totalInCents,
    status: faker.helpers.arrayElement([
      'pending',
      'processing',
      'delivering',
      'delivered',
      'canceled',
    ]),
    createdAt: faker.date.recent({ days: 40 }),
  })
}

await db.insert(orders).values(ordersToInsert)
await db.insert(orderItems).values(orderItemsToInsert)
await db.insert(ingredients).values(IngredientsToInsert)

console.log(chalk.yellowBright('✔️ Created orders!'))

console.log(chalk.yellow('Database seeded successfully!'))

process.exit()
