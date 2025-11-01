import React, { useState } from 'react';
import Row from '../atoms/Blocks';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Spinner from '../atoms/Spinner';

const Root = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Form = styled.div`
  position: relative;
  display: inline-flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;

  input:focus,
  textarea:focus,
  select:focus,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
`;

const Panel = styled.div`
  position: relative;
  display: inline-flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;

  img {
    width: 100%;
    max-width: 500px; /* maximum size on large screens */
    height: auto;
    object-fit: contain;
    transition: width 0.3s ease, max-width 0.3s ease;
  }

  @media (max-width: 900px) {
    img {
      max-width: 400px;
    }
  }

  @media (max-width: 768px) {
    img {
      display: none;
    }
  }
`;

const ErrorMsg = styled.div`
  color: #b91c1c;
  margin: 8px 0 12px 0;
`;

const ButtonContent = styled.div`
  display: inline-flex;
  align-items: center;
`;

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Try to extract a helpful message
      const msg =
        (err &&
          (err as any).response &&
          (err as any).response.data &&
          ((err as any).response.data.error || (err as any).response.data.message)) ||
        (err instanceof Error ? err.message : 'Login failed');
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Root>
      <Panel className="hide--under-768">
        <img className="flex-1" src="/login-asset.svg" alt="Building Blocks" />
      </Panel>
      <Form>
        <h2>Sign in</h2>
        <form onSubmit={onSubmit}>
          <Input
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <Input
            disabled={loading}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <Row justify="end">
            {error && <ErrorMsg role="alert">{error}</ErrorMsg>}
            <Button type="submit" disabled={loading} aria-busy={loading}>
              {loading ? (
                <ButtonContent>
                  <Spinner size={16} />
                  <span style={{ marginLeft: 8 }}>Signing in…</span>
                </ButtonContent>
              ) : (
                'Sign in'
              )}
            </Button>
          </Row>
        </form>
      </Form>
    </Root>
  );
}
