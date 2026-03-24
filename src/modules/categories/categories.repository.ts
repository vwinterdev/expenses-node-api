import { db } from '@/db'
import { categories } from '@/db/schema/categories'
import { eq } from 'drizzle-orm'

interface Category {
    name: string
    type: 'income' | 'expense'
    color: string
    icon: string
    walletId: number
}

export const createCategory = async (category: Category) => {
    return db.insert(categories).values(category).returning()
}

export const getAllCategoriesByWalletId = async (walletId: number) => {
    return db.select().from(categories).where(eq(categories.walletId, walletId))
}