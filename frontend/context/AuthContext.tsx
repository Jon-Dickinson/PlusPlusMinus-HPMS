import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from '../lib/axios'

type User = { id: number; name: string; email: string; roles?: Array<{ role: { name: string } }> }

type AuthContextValue = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (t) {
      setToken(t)
      axios.setAuthToken(t)
      axios.instance.get('/users/me').then((r) => setUser(r.data.user)).catch(() => {
        // ignore
      })
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await axios.instance.post('/auth/login', { email, password })
    const data = res.data
    const token = data.token
    if (token) {
      localStorage.setItem('token', token)
      setToken(token)
      axios.setAuthToken(token)
      setUser(data.user)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    axios.setAuthToken(null)
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
