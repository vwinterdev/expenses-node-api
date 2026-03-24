import { deleteCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { TOKEN_CONFIG } from './auth.consts'

export const setTokenCookies = (c: Context, accessToken: string, refreshToken: string) => {
  setCookie(c, TOKEN_CONFIG.access.name, accessToken, TOKEN_CONFIG.access.options)
  setCookie(c, TOKEN_CONFIG.refresh.name, refreshToken, TOKEN_CONFIG.refresh.options)
}

export const clearTokenCookies = (c: Context) => {
  deleteCookie(c, TOKEN_CONFIG.access.name, { path: '/' })
  deleteCookie(c, TOKEN_CONFIG.refresh.name, { path: '/' })
}
