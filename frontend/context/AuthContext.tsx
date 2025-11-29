import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import axios from '../lib/axios';

/* -------------------------------------------------------
 * TYPES
 * -----------------------------------------------------*/

export interface City {
  id: number;
  name: string;
  country: string;
  mayorId: number;
  gridState: any;
  buildingLog: any;
}

export interface Note {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface HierarchyInfo {
  id: number;
  name: string;
  level: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MAYOR' | 'VIEWER';
  mayorId?: number | null;
  hierarchyId?: number | null;
  hierarchy?: HierarchyInfo | null;
  city?: City | null;
  notes?: Note[];
  updatedAt?: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

/* -------------------------------------------------------
 * LOCAL STORAGE HELPERS
 * -----------------------------------------------------*/

const LS = {
  getToken: () => localStorage.getItem('token'),
  getUser: (): User | null => {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setToken: (token: string) => localStorage.setItem('token', token),
  setUser: (user: User) =>
    localStorage.setItem('user', JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

/* -------------------------------------------------------
 * CONTEXT INITIALIZATION
 * -----------------------------------------------------*/

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/* -------------------------------------------------------
 * PROVIDER
 * -----------------------------------------------------*/

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  /* ---------------------------------------------------
   * INITIALIZE AUTH FROM LOCAL STORAGE
   * -------------------------------------------------*/
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = LS.getToken();
    const storedUser = LS.getUser();

    if (storedToken) {
      setToken(storedToken);
      axios.setAuthToken(storedToken);
    }

    if (storedUser) {
      setUserState(storedUser);
    }

    setInitialized(true);
  }, []);

  /* ---------------------------------------------------
   * LOGIN FUNCTION
   * -------------------------------------------------*/
  const login = useCallback(
    async (email: string, password: string): Promise<User | null> => {
      try {
        const res = await axios.instance.post('/auth/login', {
          email,
          password,
        });

        const { token, user } = res.data;

        if (!token || !user) return null;

        // persist
        LS.setToken(token);
        LS.setUser(user);

        // update global state
        setToken(token);
        setUserState(user);
        axios.setAuthToken(token);

        return user;
      } catch (e) {
        console.error('Login failed:', e);
        return null;
      }
    },
    []
  );

  /* ---------------------------------------------------
   * LOGOUT FUNCTION
   * -------------------------------------------------*/
  const logout = useCallback(() => {
    LS.clear();
    setToken(null);
    setUserState(null);
    axios.setAuthToken(null);
  }, []);

  /* ---------------------------------------------------
   * SAFE SET USER
   * (Prevents unnecessary rerenders)
   * -------------------------------------------------*/
  const setUser = useCallback((newUser: User | null) => {
    const existing = LS.getUser();

    // Shallow compare essential fields to avoid re-renders
    if (
      existing &&
      newUser &&
      existing.id === newUser.id &&
      existing.updatedAt === (newUser as any)?.updatedAt
    ) {
      return;
    }

    if (newUser) LS.setUser(newUser);
    else localStorage.removeItem('user');

    setUserState(newUser);
  }, []);

  /* ---------------------------------------------------
   * MEMOIZED CONTEXT VALUE
   * -------------------------------------------------*/
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initialized,
      login,
      logout,
      setUser,
    }),
    [user, token, initialized, login, logout, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* -------------------------------------------------------
 * HOOK
 * -----------------------------------------------------*/

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
