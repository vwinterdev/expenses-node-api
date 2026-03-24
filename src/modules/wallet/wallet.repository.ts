import { db } from "@/db/index.ts"
import { usersToWallets } from "@/db/schema/users"
import { wallets } from "@/db/schema/wallets.ts"
import { and, eq } from "drizzle-orm"

interface Wallet {
    name: string
    description: string
    icon: string
    color: string
}

export const getAllUserWallets = async (userId: number) => {
    return await db
        .select({
            id: wallets.id,
            name: wallets.name,
            balance: wallets.balance,
            description: wallets.description,
            icon: wallets.icon,
            color: wallets.color,
        })
        .from(wallets)
        .innerJoin(usersToWallets, eq(usersToWallets.walletId, wallets.id))
        .where(eq(usersToWallets.userId, userId))
}

export const getWalletById = async (walletId: number) => {
    return await db
        .query.wallets.findFirst({
            where: eq(wallets.id, walletId)
        })
}


export const checkWalletAccess = async (userId: number, walletId: number) => {
    return !!await db
        .query.usersToWallets.findFirst({
            where: and(eq(usersToWallets.userId, userId), eq(usersToWallets.walletId, walletId))
        })
}

export const createWallet = async (userId: number, wallet: Wallet) => {
    const newWallet = await db.transaction(async (tx) => {
        const [createdWallet] = await tx.insert(wallets).values(wallet).returning()
        await tx.insert(usersToWallets).values({ userId, walletId: createdWallet.id })
        return createdWallet
    })
    return newWallet
}