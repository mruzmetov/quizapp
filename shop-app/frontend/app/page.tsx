'use client'
import { useEffect, useState } from "react"

interface User {
  id: number;
  name: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[] | null>(null)

  useEffect(() => {
    fetch('https://backend.ruzmetov.workers.dev/api/users/')
      .then(res => res.json())
      .then((data: User[]) => setUsers(data))
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1 >Next.js Frontend (Typescript)</h1>
      <h2>Backenddan kelgan ma'lumot: </h2>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </main>
  )
}