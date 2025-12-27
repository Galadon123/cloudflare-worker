import { Hono } from 'hono'

type Bindings = {
  CF_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Auth middleware - validates CF-Token header
app.use('*', async (c, next) => {
  const token = c.req.header('CF-Token')

  if (!token || token !== c.env.CF_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
})

// Route 1: Home
app.get('/', (c) => {
  return c.json({ message: 'Welcome to Tensorcode Worker!' })
})

// Route 2: Hello with name parameter
app.get('/hello/:name', (c) => {
  const name = c.req.param('name')
  return c.json({ message: `Hello, ${name}!` })
})

export default app
