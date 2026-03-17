import { Hono } from 'hono'
import { db } from '../../db/index.ts'
import { wallets, usersToWallets, categories, categoriesToWallets } from '../../db/schema.ts'
import { authMiddleware } from '../../middleware/auth.ts'
import { StatusCodes } from 'http-status-codes'
import { and, eq, sql } from 'drizzle-orm'
import { checks } from '../../db/schema.ts'

type WalletVariables = { Variables: { userId: number } }

const wallet = new Hono<WalletVariables>()

wallet.use('*', authMiddleware)

wallet.post('/create', async (c) => {
  const userId = c.get('userId')
  const { name, description, icon, color } = await c.req.json()

  const [newWallet] = await db.transaction(async (tx) => {
    const [wallet] = await tx.insert(wallets).values({ name, description, icon, color }).returning()
    await tx.insert(usersToWallets).values({ userId, walletId: wallet.id })
    return [wallet]
  })

  return c.json(newWallet, StatusCodes.CREATED)
})

wallet.get('/', async (c) => {
  const userId = c.get('userId')
  const allWallets = await db
    .select({ id: wallets.id, name: wallets.name, description: wallets.description, icon: wallets.icon, color: wallets.color, createdAt: wallets.createdAt })
    .from(wallets)
    .innerJoin(usersToWallets, eq(usersToWallets.walletId, wallets.id))
    .where(eq(usersToWallets.userId, userId))
  return c.json(allWallets, StatusCodes.OK)
})

wallet.get('/:id', async (c) => {
  const userId = c.get('userId')
  const walletId = Number(c.req.param('id'))

  const [access] = await db
    .select()
    .from(usersToWallets)
    .where(and(eq(usersToWallets.userId, userId), eq(usersToWallets.walletId, walletId)))

  if (!access) return c.json({ error: 'Wallet not found' }, StatusCodes.NOT_FOUND)

  const [walletData] = await db
    .select({ id: wallets.id, name: wallets.name, description: wallets.description, icon: wallets.icon, color: wallets.color, createdAt: wallets.createdAt })
    .from(wallets)
    .where(eq(wallets.id, walletId))

  const balanceExpr = sql<string>`COALESCE(SUM(CASE WHEN ${checks.type} = 'income' THEN ${checks.amount}::numeric WHEN ${checks.type} = 'expense' THEN -${checks.amount}::numeric ELSE 0 END), 0)`

  const [{ balance }] = await db
    .select({ balance: balanceExpr })
    .from(checks)
    .where(eq(checks.walletId, walletId))

  const categoryBalances = await db
    .select({ categoryId: checks.categoryId, balance: balanceExpr })
    .from(checks)
    .where(eq(checks.walletId, walletId))
    .groupBy(checks.categoryId)

  const walletCategories = await db
    .select({ id: categories.id, name: categories.name, type: categories.type, color: categories.color, icon: categories.icon })
    .from(categories)
    .innerJoin(categoriesToWallets, eq(categoriesToWallets.categoryId, categories.id))
    .where(eq(categoriesToWallets.walletId, walletId))

  const categoriesWithBalance = walletCategories.map(cat => ({
    ...cat,
    balance: Number(categoryBalances.find(b => b.categoryId === cat.id)?.balance ?? '0'),
  }))

  return c.json({ ...walletData, balance: Number(balance), categories: categoriesWithBalance }, StatusCodes.OK)
})

export default wallet