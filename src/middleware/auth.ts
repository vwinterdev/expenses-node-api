import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { TOKEN_CONFIG } from '../modules/auth/auth.consts.ts'

interface AuthVariables {
  userId: number
}

export const KEY_USER_ID = 'userId'

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const token = getCookie(c, TOKEN_CONFIG.access.name)

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verify(token, process.env.JWT_SECRET!, 'HS256')
    if (payload.type !== 'access') {
      return c.json({ error: 'Invalid token type' }, 401)
    }
    c.set(KEY_USER_ID, payload.userId as number)
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }

  await next()
})
