import { StatusCodes } from 'http-status-codes'
import { createRouter } from '@/lib/create-router'
import * as RepoWallet from '@/modules/wallet/wallet.repository.ts'
import * as RepoCategories from '@/modules/categories/categories.repository'

const categories = createRouter()

categories.post('/create', async (c) => {
  const userId = c.get('userId')
  const { name, type, color, icon, walletId } = await c.req.json()

  const access = await RepoWallet.checkWalletAccess(userId, walletId)
  if (!access) { return c.json({ error: 'Wallet not found' }, StatusCodes.NOT_FOUND) }

  const newCategory = await RepoCategories.createCategory({ name, type, color, icon, walletId })

  return c.json(newCategory, StatusCodes.CREATED)
})

categories.get('wallet/:walletId', async (c) => {
  const userId = c.get('userId')
  const walletId = Number(c.req.param('walletId'))

  const access = await RepoWallet.checkWalletAccess(userId, walletId)
  if (!access) { return c.json({ error: 'Wallet not found' }, StatusCodes.NOT_FOUND) }

  const allCategories = await RepoCategories.getAllCategoriesByWalletId(walletId)

  return c.json({ data: allCategories }, StatusCodes.OK)
})

export default categories
