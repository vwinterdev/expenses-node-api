export const ACCESS_EXP = 60 * 15 // 15 минут
export const REFRESH_EXP = 60 * 60 * 24 * 7 // 7 дней
export const SALT_ROUNDS = 10

const isProduction = process.env.NODE_ENV === 'production'

export const TOKEN_CONFIG = {
  access: {
    name: 'token' as const,
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'None' : 'Lax') as 'None' | 'Lax',
      maxAge: ACCESS_EXP,
      path: '/',
    },
  },
  refresh: {
    name: 'refreshToken' as const,
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'None' : 'Lax') as 'None' | 'Lax',
      maxAge: REFRESH_EXP,
      path: '/',
    },
  },
}
