import { describe, it, expect } from 'vitest';
import { normalizeRole, isAdmin, isMayor, isAdminOrMayor } from '../roles';

describe('roles util', () => {
  it('normalizes roles to uppercase string', () => {
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole(null)).toBe('');
    expect(normalizeRole(undefined)).toBe('');
  });

  it('detects admin and mayor correctly', () => {
    expect(isAdmin('ADMIN')).toBe(true);
    expect(isAdmin('user')).toBe(false);
    expect(isMayor('MAYOR')).toBe(true);
    expect(isMayor('ADMIN')).toBe(false);
  });

  it('isAdminOrMayor returns true for either role', () => {
    expect(isAdminOrMayor('admin')).toBe(true);
    expect(isAdminOrMayor('MAYOR')).toBe(true);
    expect(isAdminOrMayor('viewer')).toBe(false);
  });
});
