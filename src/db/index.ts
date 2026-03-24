import { env } from '../settings'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as enums from './schema/enums'
import * as images from './schema/images'
import * as users from './schema/users'
import * as categories from './schema/categories'
import * as wallets from './schema/wallets'
import * as checks from './schema/checks'

const schema = { ...enums, ...images, ...users, ...categories, ...wallets, ...checks }

const sql = postgres(env.databaseUrl)

export const db = drizzle(sql, { schema })
