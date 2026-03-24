
import { StatusCodes } from 'http-status-codes'
import { KEY_USER_ID } from '@/middleware/auth.ts'
import * as RepoWallet from '@/modules/wallet/wallet.repository.ts'
import { createRouter } from '@/lib/create-router'

const wallet = createRouter()

wallet.get('/', async (c) => {
  const userId = c.get(KEY_USER_ID)
  const wallets = await RepoWallet.getAllUserWallets(userId)
  return c.json({ data:wallets }, StatusCodes.OK)
})

wallet.get('/:id', async (c) => {
  const userId = c.get(KEY_USER_ID)
  const walletId = Number(c.req.param('id'))
  const access = await RepoWallet.checkWalletAccess(userId, walletId)
  if (!access) {
    return c.json({ error: 'You do not have access to this wallet' }, StatusCodes.FORBIDDEN)
  }
  const wallet = await RepoWallet.getWalletById(walletId)
  return c.json({ data: wallet }, StatusCodes.OK)
})

wallet.post('/create', async (c) => {
  const userId = c.get(KEY_USER_ID)
  const { name, description, icon, color } = await c.req.json()
  const wallet = await RepoWallet.createWallet(userId, { name, description, icon, color })
  return c.json({ data: wallet }, StatusCodes.CREATED)
})

export default wallet