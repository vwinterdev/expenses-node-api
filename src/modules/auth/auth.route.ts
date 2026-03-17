import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import { StatusCodes } from 'http-status-codes'
import * as authService from './auth.service.ts'
import { TOKEN_CONFIG } from './auth.consts.ts'

const auth = new Hono()

const setTokenCookies = (c: any, accessToken: string, refreshToken: string) => {
  setCookie(c, TOKEN_CONFIG.access.name, accessToken, TOKEN_CONFIG.access.options)
  setCookie(c, TOKEN_CONFIG.refresh.name, refreshToken, TOKEN_CONFIG.refresh.options)
}

const clearTokenCookies = (c: any) => {
  deleteCookie(c, TOKEN_CONFIG.access.name, { path: '/' })
  deleteCookie(c, TOKEN_CONFIG.refresh.name, { path: '/' })
}

auth.post('/signin', async (c) => {
  const { email, password } = await c.req.json()
  const result = await authService.signin(email, password)

  if ('error' in result) {
    const status = result.error === 'User not found' ? StatusCodes.NOT_FOUND : StatusCodes.UNAUTHORIZED
    return c.json({ error: result.error }, status)
  }

  setTokenCookies(c, result.accessToken, result.refreshToken)
  return c.json({ user: result.user }, StatusCodes.OK)
})

auth.post('/signup', async (c) => {
  const { name, email, password } = await c.req.json()
  const { user, accessToken, refreshToken } = await authService.signup(name, email, password)

  setTokenCookies(c, accessToken, refreshToken)
  return c.json({ user }, StatusCodes.CREATED)
})

auth.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, TOKEN_CONFIG.refresh.name)
  if (!refreshToken) {
    return c.json({ error: 'Refresh token not found' }, StatusCodes.UNAUTHORIZED)
  }

  try {
    const tokens = await authService.refresh(refreshToken)
    setTokenCookies(c, tokens.accessToken, tokens.refreshToken)
    return c.json({ message: 'Tokens refreshed' }, StatusCodes.OK)
  } catch {
    clearTokenCookies(c)
    return c.json({ error: 'Invalid refresh token' }, StatusCodes.UNAUTHORIZED)
  }
})

auth.post('/signout', async (c) => {
  clearTokenCookies(c)
  return c.json({ message: 'Signed out' }, StatusCodes.OK)
})

auth.get('/me', async (c) => {
  const token = getCookie(c, TOKEN_CONFIG.access.name)
  if (!token) {
    return c.json({ error: 'Not authenticated' }, StatusCodes.UNAUTHORIZED)
  }

  try {
    const user = await authService.me(token)
    return c.json({ user }, StatusCodes.OK)
  } catch {
    return c.json({ error: 'Invalid token' }, StatusCodes.UNAUTHORIZED)
  }
})

export default auth
