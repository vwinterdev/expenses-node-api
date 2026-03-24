import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { StatusCodes } from 'http-status-codes'
import { TOKEN_CONFIG } from './auth.consts'
import * as authService from './auth.service'
import { clearTokenCookies, setTokenCookies } from './auth.helpers'

const auth = new Hono()

auth.post('/signin', async (c) => {
  try {
    const { email, password } = await c.req.json()
    const { user, accessToken, refreshToken } = await authService.signin(email, password)

    setTokenCookies(c, accessToken, refreshToken)
    return c.json({ user }, StatusCodes.OK)
  } catch {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, { message: 'Invalid credentials' })
  }
})

auth.post('/signup', async (c) => {
  const { name, email, password } = await c.req.json()
  const { user, accessToken, refreshToken } = await authService.signup(name, email, password)

  setTokenCookies(c, accessToken, refreshToken)
  return c.json({ data: user }, StatusCodes.CREATED)
})

auth.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, TOKEN_CONFIG.refresh.name)
  if (!refreshToken) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, { message: 'Refresh token not found' })
  }

  try {
    const tokens = await authService.refresh(refreshToken)
    setTokenCookies(c, tokens.accessToken, tokens.refreshToken)
    return c.json({ message: 'Tokens refreshed' }, StatusCodes.OK)
  } catch {
    clearTokenCookies(c)
    throw new HTTPException(StatusCodes.UNAUTHORIZED, { message: 'Invalid refresh token' })
  }
})

auth.post('/signout', async (c) => {
  clearTokenCookies(c)
  return c.json({ message: 'Signed out' }, StatusCodes.OK)
})

auth.get('/me', async (c) => {
  const token = getCookie(c, TOKEN_CONFIG.access.name)
  if (!token) {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, { message: 'Not authenticated' })
  }

  try {
    const user = await authService.me(token)
    return c.json({ data:user }, StatusCodes.OK)
  } catch {
    throw new HTTPException(StatusCodes.UNAUTHORIZED, { message: 'Invalid token' })
  }
})

export default auth
