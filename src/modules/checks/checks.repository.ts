import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { checks } from '@/db/schema/checks'
import { wallets } from '@/db/schema/wallets'

interface Check {
    type: 'income' | 'expense',
    amount: number,
    description: string,
    categoryId: number,
    walletId: number,
    userId: number
}

export const createCheckAndUpdateWalletBalance = async (check: Check) => {
    return db.transaction(async (tx) => {
        const [newCheck] = await tx.insert(checks).values(check).returning()

        const delta = check.type === 'income' ? check.amount : -check.amount

        await tx
            .update(wallets)
            .set({ balance: sql`${wallets.balance} + ${delta}` })
            .where(eq(wallets.id, check.walletId))

        return newCheck
    })
}
