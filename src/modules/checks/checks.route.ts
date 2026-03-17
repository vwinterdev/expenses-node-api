import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { StatusCodes } from 'http-status-codes'
import { db } from '../../db'
import { checks, usersToWallets, categoriesToWallets } from '../../db/schema'
import { authMiddleware } from '../../middleware/auth'

type ChecksVariables = { Variables: { userId: number } }

const router = new Hono<ChecksVariables>()

router.use('*', authMiddleware)

router.post('/create', async (c) => {
  const userId = c.get('userId')
  const { type, amount, description, categoryId, walletId } = await c.req.json()

  // check wallet belongs to user
  const [walletAccess] = await db
    .select()
    .from(usersToWallets)
    .where(and(eq(usersToWallets.userId, userId), eq(usersToWallets.walletId, Number(walletId))))

  if (!walletAccess) return c.json({ error: 'Wallet not found' }, StatusCodes.NOT_FOUND)

  // check category belongs to wallet
  const [categoryAccess] = await db
    .select()
    .from(categoriesToWallets)
    .where(and(eq(categoriesToWallets.walletId, Number(walletId)), eq(categoriesToWallets.categoryId, Number(categoryId))))

  if (!categoryAccess) return c.json({ error: 'Category not found in this wallet' }, StatusCodes.NOT_FOUND)

  const [newCheck] = await db
    .insert(checks)
    .values({ type, amount: String(amount), description, categoryId: Number(categoryId), walletId: Number(walletId) })
    .returning()

  return c.json(newCheck, StatusCodes.CREATED)
})

export default router
