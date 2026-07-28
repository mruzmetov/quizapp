import { Hono } from 'hono'
import {cors} from 'hono/cors'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
  return c.json({ message:'Cloudflare backend TS da ishlayabdi'})
})

type User = {
  id: number;
  name: string;
}

app.get('/api/users/', (c) => {
  const users: User[] = [
    { id: 1, name: "Mohirbek"},
    { id: 2, name: "Ruzmetov"}
  ]
  return c.json(users)
})

export default app
