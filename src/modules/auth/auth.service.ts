import { sign, verify } from 'hono/jwt'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schema'
import { ACCESS_EXP, REFRESH_EXP, SALT_ROUNDS } from './auth.consts'

const generateAccessToken = (userId: number) => {
  return sign(
    { userId, type: 'access', exp: Math.floor(Date.now() / 1000) + ACCESS_EXP },
    process.env.JWT_SECRET!
  )
}

const generateRefreshToken = (userId: number) => {
  return sign(
    { userId, type: 'refresh', exp: Math.floor(Date.now() / 1000) + REFRESH_EXP },
    process.env.JWT_SECRET!,
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
  const [user] = await db.select().from(users).where(eq(users.email, email))
  if (!user) {
    return { error: 'User not found' as const }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { error: 'Invalid password' as const }
  }

  const tokens = await generateTokens(user.id)
  return { user, ...tokens }
}

export const signup = async (name: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
  const [user] = await db
    .insert(users)
    .values({ name, email, password: hashedPassword })
    .returning()

  const tokens = await generateTokens(user.id)
  return { user, ...tokens }
}

export const refresh = async (refreshToken: string) => {
  const payload = await verify(refreshToken, process.env.JWT_SECRET!, 'HS256')

  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type')
  }

  const [user] = await db.select().from(users).where(eq(users.id, payload.userId as number))
  if (!user) {
    throw new Error('User not found')
  }

  return generateTokens(user.id)
}

export const me = async (token: string) => {
  const payload = await verify(token, process.env.JWT_SECRET!, 'HS256')

  if (payload.type !== 'access') {
    throw new Error('Invalid token type')
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, payload.userId as number))

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
