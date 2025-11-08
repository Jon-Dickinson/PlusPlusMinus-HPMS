import React, { ReactNode, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { normalizeRole } from '../../../utils/roles';

type Props = {
  allowed?: string[]; // roles like ['ADMIN','MAYOR']
  predicate?: (user: any) => boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Small authorization wrapper used in JSX to avoid repeating role checks.
 * - `allowed` accepts an array of role strings (case-insensitive).
 * - `predicate` is an optional custom check that receives the user.
 * - `fallback` renders when the user is not authorized (defaults to null).
 */
export default function Authorized({ allowed, predicate, fallback = null, children }: Props) {
  const { user } = useAuth();

  const authorized = useMemo(() => {
    if (!user) return false;
    if (typeof predicate === 'function') return predicate(user);
    if (Array.isArray(allowed) && allowed.length > 0) {
      const userRole = normalizeRole(user.role || '');
      return allowed.map(normalizeRole).includes(userRole);
    }
    // default: any authenticated user
    return !!user;
  }, [user, allowed, predicate]);

  return authorized ? <>{children}</> : <>{fallback}</>;
}
