import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './modules/auth/auth.route.ts'
import wallet from './modules/wallet/wallet.route.ts'
import categories from './modules/categories/categories.route.ts'
import checks from './modules/checks/checks.route.ts'
import 'dotenv/config'

const app = new Hono()

app.use('*', cors({
  origin: 'https://expenses-sand-alpha.vercel.app',
  credentials: true,
}))

app.get('/', (c) => c.text('ok'))

app.route('/api/auth', auth)
app.route('/api/wallets', wallet)
app.route('/api/categories', categories)
app.route('/api/checks', checks)

export default app
