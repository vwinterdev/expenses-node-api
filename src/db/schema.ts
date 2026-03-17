import { pgTable, pgEnum, serial, text, timestamp, numeric, integer, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transactionType = pgEnum('transaction_type', ['income', 'expense', 'mixed']);

export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  extension: text('extension').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: transactionType('type').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  avatar: integer('avatar').references(() => images.id),
  email: text('email').notNull(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const checks = pgTable('checks', {
  id: serial('id').primaryKey(),
  type: transactionType('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const usersToWallets = pgTable('users_to_wallets', {
  userId: integer('user_id').notNull().references(() => users.id),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
}, (t) => [primaryKey({ columns: [t.userId, t.walletId] })])

export const categoriesToWallets = pgTable('categories_to_wallets', {
  categoryId: integer('category_id').notNull().references(() => categories.id),
  walletId: integer('wallet_id').notNull().references(() => wallets.id),
}, (t) => [primaryKey({ columns: [t.categoryId, t.walletId] })])

// Relations

export const usersRelations = relations(users, ({ one, many }) => ({
  avatar: one(images, { fields: [users.avatar], references: [images.id] }),
  wallets: many(usersToWallets),
}))

export const walletsRelations = relations(wallets, ({ many }) => ({
  users: many(usersToWallets),
  categories: many(categoriesToWallets),
  checks: many(checks),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  wallets: many(categoriesToWallets),
  checks: many(checks),
}))

export const checksRelations = relations(checks, ({ one }) => ({
  category: one(categories, { fields: [checks.categoryId], references: [categories.id] }),
  wallet: one(wallets, { fields: [checks.walletId], references: [wallets.id] }),
}))

export const usersToWalletsRelations = relations(usersToWallets, ({ one }) => ({
  user: one(users, { fields: [usersToWallets.userId], references: [users.id] }),
  wallet: one(wallets, { fields: [usersToWallets.walletId], references: [wallets.id] }),
}))

export const categoriesToWalletsRelations = relations(categoriesToWallets, ({ one }) => ({
  category: one(categories, { fields: [categoriesToWallets.categoryId], references: [categories.id] }),
  wallet: one(wallets, { fields: [categoriesToWallets.walletId], references: [wallets.id] }),
}))
