import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '../lib/axios';

type City = {
  id: number;
  name: string;
  country: string;
  mayorId: number;
  gridState: any;
  buildingLog: any;
}

type Note = {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

type User = {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MAYOR' | 'VIEWER';
  city?: City | null;
  notes?: Note[];
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const u = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (t) {
      setToken(t);
      axios.setAuthToken(t);
    }
    if (u) {
      try {
        setUserState(JSON.parse(u));
      } catch (e) {
        // if decoding fails, silently ignore
        setUserState(null);
      }
    }
  }, []);

  async function login(email: string, password: string): Promise<User | null> {
    const res = await axios.instance.post('/auth/login', { email, password });
    const data = res.data;
    const token = data.token;
    const user = data.user;

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUserState(user);
      axios.setAuthToken(token);
      return user;
    }
    return null;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUserState(null);
    axios.setAuthToken(null);
  }

  function setUser(newUser: User | null) {
    const oldUser = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Prevent re-render if user data is the same
    if (JSON.stringify(newUser) === JSON.stringify(oldUser)) {
      return;
    }

    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
    setUserState(newUser);
  }

  return (
    <AuthContext.Provider value={{ user: user, token, login, logout, setUser }}>{children}</AuthContext.Provider>
  );
};

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
