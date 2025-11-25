import { HierarchyLevel, BasicUser } from '../../types/hierarchy';

import type { User } from './user-list.types';

export default function buildOrderedUsers(tree: HierarchyLevel[], allUsers: User[]) {
  const ordered: User[] = [];
  const seen = new Set<number>();

  const traverse = (node?: HierarchyLevel) => {
    if (!node) return;

    if (node.users && node.users.length) {
      node.users.forEach((basicUser: BasicUser) => {
        const fullUser = allUsers.find((u) => u.id === basicUser.id);
        if (fullUser && !seen.has(fullUser.id)) {
          ordered.push(fullUser);
          seen.add(fullUser.id);
        }
      });
    }

    if (node.children && node.children.length) {
      node.children.forEach((child) => traverse(child));
    }
  };

  tree.forEach((root) => traverse(root));

  // append remaining users not found in the tree
  allUsers.forEach((u) => {
    if (!seen.has(u.id)) ordered.push(u);
  });

  return ordered;
}
