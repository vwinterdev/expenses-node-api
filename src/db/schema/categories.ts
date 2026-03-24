import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { transactionType } from './enums'
import { wallets } from './wallets'
import { checks } from './checks'
import { timestamps } from '../helpers/columns.helpers'

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: transactionType('type').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
  ...timestamps,
})

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  wallet: one(wallets, { fields: [categories.walletId], references: [wallets.id] }),
  checks: many(checks),
}))
