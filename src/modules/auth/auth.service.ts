import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { sign, verify } from 'hono/jwt'
import { db } from '../../db/index'
import { users } from '../../db/schema/users'
import { ACCESS_EXP, REFRESH_EXP, SALT_ROUNDS } from './auth.consts'
import { env } from '../../settings'
import { createUser, getUserById, getUserByEmail } from './auth.repository'

const generateAccessToken = (userId: number) => {
  return sign(
    { userId, type: 'access', exp: Math.floor(Date.now() / 1000) + ACCESS_EXP },
    env.jwtSecret
  )
}

const generateRefreshToken = (userId: number) => {
  return sign(
    { userId, type: 'refresh', exp: Math.floor(Date.now() / 1000) + REFRESH_EXP },
    env.jwtSecret,
    'HS256'
  )
}

export const generateTokens = async (userId: number) => {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(userId),
    generateRefreshToken(userId),
  ])
  return { accessToken, refreshToken }
}

export const signin = async (email: string, password: string) => {
  const user = await getUserByEmail(email)
  
  if (!user) throw new Error('User not found')

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) throw new Error('Invalid password')

  const tokens = await generateTokens(user.id)

  return { user, ...tokens }
}

export const signup = async (name: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  const user = await createUser({ name, email, password: hashedPassword })

  const tokens = await generateTokens(user.id)

  return { user, ...tokens }
}

export const refresh = async (refreshToken: string) => {
  const payload = await verify(refreshToken, env.jwtSecret, 'HS256')

  if (payload.type !== 'refresh') throw new Error('Invalid token type')

  const user = await getUserById(payload.userId as number)

  if (!user) throw new Error('User not found')

  return generateTokens(user.id)
}

export const me = async (token: string) => {
  const payload = await verify(token, env.jwtSecret, 'HS256')

  if (payload.type !== 'access') throw new Error('Invalid token type')

  const user = await getUserById(Number(payload.userId))

  if (!user) throw new Error('User not found')

  return user
}
