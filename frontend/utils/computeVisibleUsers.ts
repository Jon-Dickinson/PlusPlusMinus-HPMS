export function computeVisibleUsers(orderedUsers: any[] | null) {
  const displayUsers = orderedUsers !== null ? orderedUsers : [];
  const mayors = displayUsers.filter((u: any) => u.role === 'MAYOR');
  const isOrdering = orderedUsers === null;
  return { displayUsers, mayors, isOrdering };
}
