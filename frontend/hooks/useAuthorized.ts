import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../utils/roles';

type Role = string;
type UserWithRole = { role?: Role } | null | undefined;

type PredicateFn = (user: NonNullable<UserWithRole>) => boolean;

/**
 * Pure helper: determine authorization for a given user object.
 * Fully typed + predictable.
 */
export function authorizeUser(
  user: UserWithRole,
  allowed?: Role[],
  predicate?: PredicateFn
): boolean {
  if (!user) return false;

  // Predicate overrides everything else
  if (predicate) return predicate(user);

  // Role-based check
  if (allowed && allowed.length > 0) {
    const userRole = normalizeRole(user.role ?? '');
    const allowedRoles = allowed.map(normalizeRole);
    return allowedRoles.includes(userRole);
  }

  // No rules → allow authenticated user
  return true;
}

/**
 * Hook returning whether the current user is authorized.
 * Memoized and stable.
 */
export default function useAuthorized(
  allowed?: Role[],
  predicate?: PredicateFn
): boolean {
  const { user } = useAuth();

  // Normalize allowed roles to stabilize memo dependency
  const normalizedAllowed = useMemo(
    () => (allowed ? allowed.map(normalizeRole) : undefined),
    [allowed]
  );

  return useMemo(
    () => authorizeUser(user, normalizedAllowed, predicate),
    [user, normalizedAllowed, predicate]
  );
}
