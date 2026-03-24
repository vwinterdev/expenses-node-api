import { and, eq, gte, lt, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { startOfMonth, endOfMonth } from 'date-fns'
import { db } from '@/db/index'
import { checks } from '@/db/schema/checks'
import { categories } from '@/db/schema/categories'
import { authMiddleware } from '@/middleware/auth'
import { checkWalletAccess } from '../wallet/wallet.repository'

interface StatisticsVariables { Variables: { userId: number } }

const statistics = new Hono<StatisticsVariables>()

statistics.use('*', authMiddleware)

statistics.get('/wallet-by-period/:id', async (c) => {
  const userId = c.get('userId')
  const walletId = Number(c.req.param('id'))
  const { date: dateParam } = c.req.query()

  const access = await checkWalletAccess(userId, walletId)
  if (!access) return c.json({ error: 'Wallet not found' }, 403)

  const date = new Date(dateParam)
  const from = startOfMonth(date)
  const to = endOfMonth(date)

  const periodFilter = and(
    eq(checks.walletId, walletId),
    gte(checks.createdAt, from),
    lt(checks.createdAt, to),
  )

  const [summary, listCategories] = await Promise.all([
    db
      .select({
        totalIncome: sql<number>`SUM(CASE WHEN ${checks.type} = 'income' THEN ${checks.amount} ELSE 0 END)::int`,
        totalExpense: sql<number>`SUM(CASE WHEN ${checks.type} = 'expense' THEN ${checks.amount} ELSE 0 END)::int`,
      })
      .from(checks)
      .where(periodFilter)
      .then(rows => rows[0]),

    db
      .select({
        categoryId: checks.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
        categoryType: categories.type,
        total: sql<number>`SUM(CASE WHEN ${checks.type} = 'income' THEN ${checks.amount} ELSE -${checks.amount} END)::int`,
      })
      .from(checks)
      .innerJoin(categories, eq(checks.categoryId, categories.id))
      .where(periodFilter)
      .groupBy(checks.categoryId, categories.name, categories.color, categories.icon, categories.type),
  ])

  return c.json({ data: { summary, listCategories } })
})

export default statistics