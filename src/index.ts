import { Hono } from 'hono'

const app = new Hono()

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
