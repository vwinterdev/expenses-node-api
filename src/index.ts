import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import auth from './modules/auth/auth.route'
import categories from './modules/categories/categories.route'
import checks from './modules/checks/checks.route'
import wallet from './modules/wallet/wallet.route'
import 'dotenv/config'
import statistics from './modules/statistics/statistic.route'

const app = new Hono()

app.use('*', cors({
  origin: 'https://expenses-sand-alpha.vercel.app',
  credentials: true,
}))

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message, message: err.message || '' }, err.status)
  }
  return c.json({ error: 'Internal server error' }, 500)
})

app.get('/', (c) => c.text('ok'))

app.route('/api/auth', auth)
app.route('/api/wallets', wallet)
app.route('/api/categories', categories)
app.route('/api/checks', checks)
app.route('/api/statistics', statistics)
export default app
