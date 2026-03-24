import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { checkWalletAccess } from '../modules/wallet/wallet.repository'

interface WalletAccessVariables {
  userId: number
}

export const walletAccessMiddleware = createMiddleware<{ Variables: WalletAccessVariables }>(async (c, next) => {
  const userId = c.get('userId')
  const walletId = Number(c.req.param('id') ?? c.req.param('walletId'))

  const access = await checkWalletAccess(userId, walletId)
  if (!access) throw new HTTPException(403, { message: 'Wallet not found' })

  await next()
})
