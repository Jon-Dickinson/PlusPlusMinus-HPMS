import React, { useEffect, useState } from 'react'
import MainTemplate from '../templates/MainTemplate'
import { useAuth } from '../context/AuthContext'
import axios from '../lib/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const [serverTime, setServerTime] = useState<string | null>(null)

  useEffect(() => {
    // example call to backend
    axios.instance.get('/buildings').then(() => setServerTime(new Date().toISOString())).catch(() => {})
  }, [])

  return (
    <MainTemplate>
      <div style={{ padding: 20 }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name ?? 'Guest'}</p>
        <p>Your roles: {user?.roles?.map((r) => r.role.name).join(', ')}</p>
        <p>Last check: {serverTime ?? '—'}</p>
      </div>
    </MainTemplate>
  )
}
