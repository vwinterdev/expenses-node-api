import { serve } from '@hono/node-server'
import app from './index.ts'

serve({ fetch: app.fetch, port: 3000 }, (info: any) => {
  console.log(`Server running on http://localhost:${info.port}`)
})
