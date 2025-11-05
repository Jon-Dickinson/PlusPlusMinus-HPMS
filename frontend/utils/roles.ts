export function normalizeRole(role?: string | null) {
  return (role || '').toString().toUpperCase();
}

export function isAdmin(role?: string | null) {
  return normalizeRole(role) === 'ADMIN';
}

export function isMayor(role?: string | null) {
  return normalizeRole(role) === 'MAYOR';
}

export function isAdminOrMayor(role?: string | null) {
  const r = normalizeRole(role);
  return r === 'ADMIN' || r === 'MAYOR';
}

export default {
  normalizeRole,
  isAdmin,
  isMayor,
  isAdminOrMayor,
};
