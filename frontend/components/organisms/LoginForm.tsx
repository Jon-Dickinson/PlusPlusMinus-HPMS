import React, { useState } from 'react'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import styled from 'styled-components'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'
// import Spinner from '../atoms/Spinner'

const Wrap = styled.div`
  max-width: 420px;
  margin: 80px auto;
  background: white;
  padding: 24px;
  border-radius: 8px;
`

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      // Try to extract a helpful message
      const msg = (err && (err as any).response && (err as any).response.data && ((err as any).response.data.error || (err as any).response.data.message)) || (err instanceof Error ? err.message : 'Login failed')
      setError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Wrap>
      <h2>Sign in</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <Input disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Input disabled={loading} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        </div>
        {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
        <Button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? (
            <ButtonContent>
              {/* <Spinner size={16} /> */}
              <span style={{ marginLeft: 8 }}>Signing in…</span>
            </ButtonContent>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </Wrap>
  )
}

const ErrorMsg = styled.div`
  color: #b91c1c;
  margin: 8px 0 12px 0;
`

const ButtonContent = styled.div`
  display: inline-flex;
  align-items: center;
`
