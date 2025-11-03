import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../lib/axios';

type User = { id: number; name: string; email: string; roles?: Array<{ role: { name: string } }> };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (t) {
      setToken(t);
      axios.setAuthToken(t);
      // Instead of relying on a `/users/me` endpoint (which may be removed),
      // decode the JWT payload client-side to populate basic user info such as
      // id and role. This keeps the UI responsive after a page refresh without
      // requiring an extra backend route.
      try {
        const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const userFromToken: any = { id: payload.id, roles: [{ role: { name: payload.role } }] };
        setUser(userFromToken);
      } catch (e) {
        // if decoding fails, silently ignore — UI will remain unauthenticated
      }
    }
  }, []);

  async function login(email: string, password: string) {
    const res = await axios.instance.post('/auth/login', { email, password });
    const data = res.data;
    const token = data.token;
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
      axios.setAuthToken(token);
      // Backend currently returns only a JWT token. Decode the token to extract
      // basic user info (id and role) so the app can reflect admin status.
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        setUser({ id: payload.id, roles: [{ role: { name: payload.role } }] } as any);
      } catch (e) {
        setUser(null);
      }
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    axios.setAuthToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
