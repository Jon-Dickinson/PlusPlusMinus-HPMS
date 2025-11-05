import React, { useState } from 'react';
import Row from '../atoms/Blocks';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { isAdmin } from '../../utils/roles';
import { useRouter } from 'next/router';
import Spinner from '../atoms/Spinner';
import Link from 'next/link';
import Brand from '../atoms/Brand';


const Root = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: #ffffff;


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


  h2 {
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
  }
`;


const Jonathan = styled.div`
  position: absolute;
  bottom: 10px;
  right: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;


  p {
    color: #000000;
  }


   @media (max-width: 960px) {
    margin-top: 20px;
    position: relative;
    bottom: auto;
    right: auto;
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
  padding: 40px;


  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    transition: width 0.3s ease, max-width 0.3s ease;


     @media (max-width: 960px) {
     padding-top: 50px;
        max-width: 280px;
      }


  }
`;


const InnerPanel = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  max-width: 480px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`;


const SignIn = styled.h3`
  color: #000000;
  margin: 0 0 15px;
  font-size: 18px;
  text-align: left;
  width: 100%;
  padding: 0 2px;
`;


const Register = styled.div`
  color: #000000;
  margin: 0;
  font-size: 13px;
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
      const user = await login(email, password);
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
        <img className="flex-1" src="/login-city.png" alt="Building Blocks" />
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
