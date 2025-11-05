import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/roles';

/**
 * Pure helper: determine authorization for a given user object.
 * Exported so it can be unit-tested without React.
 */
export function authorizeUser(user: any, allowed?: string[], predicate?: (user: any) => boolean) {
  if (!user) return false;
  if (typeof predicate === 'function') return predicate(user);
  if (Array.isArray(allowed) && allowed.length > 0) {
    const u = normalizeRole(user.role || '');
    return allowed.map(normalizeRole).includes(u);
  }
  return !!user;
}

/**
 * Hook returning a boolean whether the current user is authorized.
 * Delegates to `authorizeUser` and memoizes the result.
 */
export default function useAuthorized(allowed?: string[], predicate?: (user: any) => boolean) {
  const { user } = useAuth();
  return useMemo(() => authorizeUser(user, allowed, predicate), [user, allowed, predicate]);
}
