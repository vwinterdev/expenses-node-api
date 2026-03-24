import { Hono } from 'hono'
import { authMiddleware } from '@/middleware/auth'

interface AuthVariables {
  Variables: { userId: number }
}

export const createRouter = () => {
  const router = new Hono<AuthVariables>()
  router.use('*', authMiddleware)
  return router
}
