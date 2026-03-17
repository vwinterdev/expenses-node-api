import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './modules/auth/auth.route'
import wallet from './modules/wallet/wallet.route'
import categories from './modules/categories/categories.route'
import checks from './modules/checks/checks.route'

const app = new Hono()

app.use('*', cors({
  origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
  credentials: true,
}))

app.route('/api/auth', auth)
app.route('/api/wallets', wallet)
app.route('/api/categories', categories)
app.route('/api/checks', checks)

export default app
