import React, { useState } from 'react';
import { Row } from '../../atoms/Blocks';
import Input from '../../atoms/Input';
import Button from '../../atoms/Button';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin } from '../../../utils/roles';
import { useRouter } from 'next/router';
import Spinner from '../../atoms/Spinner';
import Link from 'next/link';
import Brand from '../../atoms/Brand';
import {
  Root,
  Form,
  Jonathan,
  Panel,
  InnerPanel,
  SignIn,
  Register,
  ErrorMsg,
  ButtonContent,
} from './styles';

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
      // Trim the email to avoid accidental leading/trailing whitespace from user input
      const user = await login(email.trim(), password);
      if (user) {
        if (isAdmin(user.role)) {
          router.push('/user-list');
        } else if (user.role === 'VIEWER' && (user as any).mayorId) {
          // If a viewer is linked to a mayor, send them straight to the mayor view
          const mid = (user as any).mayorId;
          router.push(`/mayor-view/${mid}`);
        } else {
          router.push('/dashboard');
        }
      }
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
      <Brand />

      <Row height={100} justify="between">
        <Panel className="hide--under-960">
          <img className="max-w-400" src="/login-city.png" alt="Building Blocks" />
        </Panel>
        <Form>
          <InnerPanel>
            <SignIn>Sign in</SignIn>
            <form onSubmit={onSubmit}>
              <Input
                disabled={loading}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Email"
              />

              <Input
                disabled={loading}
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Password"
              />

              <Row justify="between">
                <Register>
                  <Link href="/register" legacyBehavior>
                    <a>Register</a>
                  </Link>
                </Register>

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

          </InnerPanel>
          <Jonathan>
            <p>Developed by Jonathan Dickinson</p>
          </Jonathan>
        </Form>

      </Row>

    </Root>
  );
}