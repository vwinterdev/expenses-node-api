import { relations } from "drizzle-orm";
import { integer, serial, pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { images } from "./images";
import { wallets } from "./wallets";
import { timestamps } from "../helpers/columns.helpers";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    avatar: integer('avatar').references(() => images.id),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    ...timestamps,
})

export const usersToWallets = pgTable('users_to_wallets', {
    userId: integer('user_id').notNull().references(() => users.id),
    walletId: integer('wallet_id').notNull().references(() => wallets.id),
}, (t) => [primaryKey({ columns: [t.userId, t.walletId] })])

export const usersRelations = relations(users, ({ one, many }) => ({
    avatar: one(images, { fields: [users.avatar], references: [images.id] }),
    wallets: many(usersToWallets),
}))

export const usersToWalletsRelations = relations(usersToWallets, ({ one }) => ({
    user: one(users, { fields: [usersToWallets.userId], references: [users.id] }),
    wallet: one(wallets, { fields: [usersToWallets.walletId], references: [wallets.id] }),
}))