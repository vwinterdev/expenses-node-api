import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { usersToWallets } from './users'
import { categories } from './categories'
import { checks } from './checks'
import { timestamps } from '../helpers/columns.helpers'

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  balance: integer('balance').notNull().default(0),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  ...timestamps,
})

export const walletsRelations = relations(wallets, ({ many }) => ({
  users: many(usersToWallets),
  categories: many(categories),
  checks: many(checks),
}))
