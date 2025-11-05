import { describe, it, expect } from 'vitest';
import { authorizeUser } from './useAuthorized';

describe('authorizeUser', () => {
  it('returns false for no user', () => {
    expect(authorizeUser(null, ['ADMIN'])).toBe(false);
  });

  it('allows user when role is in allowed (case-insensitive)', () => {
    const user = { role: 'admin' };
    expect(authorizeUser(user, ['ADMIN'])).toBe(true);
  });

  it('supports predicate function', () => {
    const user = { id: 5, role: 'VIEWER' };
    expect(authorizeUser(user, undefined, (u) => u.id === 5)).toBe(true);
    expect(authorizeUser(user, undefined, (u) => u.id === 6)).toBe(false);
  });

  it('defaults to true for any authenticated user when no allowed/predicate given', () => {
    const user = { id: 1, role: 'VIEWER' };
    expect(authorizeUser(user)).toBe(true);
  });
});
