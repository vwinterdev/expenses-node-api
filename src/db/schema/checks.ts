import { relations } from "drizzle-orm";
import { integer, numeric, pgTable, serial, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { categories } from "./categories";
import { transactionType } from "./enums";
import { wallets } from "./wallets";
import { timestamps } from "../helpers/columns.helpers";
import { users } from "./users";

export const checks = pgTable('checks', {
    id: serial('id').primaryKey(),
    type: transactionType('type').notNull(),
    amount: integer('amount').notNull(),
    description: text('description'),   
    categoryId: integer('category_id').notNull().references(() => categories.id),
    walletId: integer('wallet_id').notNull().references(() => wallets.id),
    userId: integer('user_id').notNull().references(() => users.id),
    ...timestamps,
})


export const checksRelations = relations(checks, ({ one }) => ({
    category: one(categories, { fields: [checks.categoryId], references: [categories.id] }),
    wallet: one(wallets, { fields: [checks.walletId], references: [wallets.id] }),
    user: one(users, { fields: [checks.userId], references: [users.id] }),
}))