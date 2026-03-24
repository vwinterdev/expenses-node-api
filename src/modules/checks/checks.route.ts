import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { StatusCodes } from 'http-status-codes'
import { db } from '../../db/index'
import { checks } from '../../db/schema/checks'
import { categories } from '../../db/schema/categories'
import { usersToWallets } from '../../db/schema/users'
import { authMiddleware } from '../../middleware/auth'
import { createRouter } from '@/lib/create-router'
import * as RepoWallet from '@/modules/wallet/wallet.repository.ts'
import * as RepoChecks from '@/modules/checks/checks.repository.ts'

const checks = createRouter()

checks.post('/create', async (c) => {
  const userId = c.get('userId')
  const { type, amount, description, categoryId, walletId } = await c.req.json()
  const access = await RepoWallet.checkWalletAccess(userId, walletId)
  if (!access) { return c.json({ error: 'You do not have access to this wallet' }, StatusCodes.FORBIDDEN) }
  const newCheck = await RepoChecks.createCheckAndUpdateWalletBalance({ type, amount, description, categoryId, walletId, userId })
  return c.json(newCheck, StatusCodes.CREATED)
})

export default checks
