import React, { useState } from 'react'
import Input from '../atoms/Input'
import Button from '../atoms/Button'
import styled from 'styled-components'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'
// import Spinner from '../atoms/Spinner'

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('/bg.png'), linear-gradient(180deg, #e6f0ff 0%, #f8fafc 100%);
  background-size: cover, auto;
  background-position: center center, center;
`

const Wrap = styled.div`
  width: 100%;
  max-width: 420px;
  margin: 32px;
  background: rgba(255,255,255,0.95);
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(15,23,42,0.08);
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
    <Page>
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
    </Page>
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
