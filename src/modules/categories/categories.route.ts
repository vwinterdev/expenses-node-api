import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { StatusCodes } from 'http-status-codes'
import { db } from '../../db/index.ts'
import { categories, categoriesToWallets, usersToWallets } from '../../db/schema.ts'
import { authMiddleware } from '../../middleware/auth.ts'

type CategoriesVariables = { Variables: { userId: number } }

const router = new Hono<CategoriesVariables>()

router.use('*', authMiddleware)

router.post('/create', async (c) => {
  const userId = c.get('userId')
  const { name, type, color, icon, walletId } = await c.req.json()

  // check that the wallet belongs to the user
  const [access] = await db
    .select()
    .from(usersToWallets)
    .where(and(eq(usersToWallets.userId, userId), eq(usersToWallets.walletId, walletId)))

  if (!access) return c.json({ error: 'Wallet not found' }, StatusCodes.NOT_FOUND)

  const [newCategory] = await db.transaction(async (tx) => {
    const [category] = await tx.insert(categories).values({ name, type, color, icon }).returning()
    await tx.insert(categoriesToWallets).values({ categoryId: category.id, walletId })
    return [category]
  })

  return c.json(newCategory, StatusCodes.CREATED)
})

router.get('wallet/:walletId', async (c) => {
  const userId = c.get('userId')
  const walletId = Number(c.req.param('walletId'))

  const [access] = await db
    .select()
    .from(usersToWallets)
    .where(and(eq(usersToWallets.userId, userId), eq(usersToWallets.walletId, walletId)))

  if (!access) return c.json({ error: 'Wallet not found' }, StatusCodes.NOT_FOUND)

  const allCategories = await db
    .select({ id: categories.id, name: categories.name, type: categories.type, color: categories.color, icon: categories.icon })
    .from(categories)
    .innerJoin(categoriesToWallets, eq(categoriesToWallets.categoryId, categories.id))
    .where(eq(categoriesToWallets.walletId, walletId))

  return c.json(allCategories, StatusCodes.OK)
})

export default router
