import { useEffect, useMemo } from 'react';
import buildOrderedUsers from '../utils/buildOrderedUsers';

export interface HierarchyNode {
  id: number;
  parentId?: number | null;
  children?: HierarchyNode[];
  [key: string]: any;
}

export interface UserLike {
  id: number;
  [key: string]: any;
}

interface Params<U extends UserLike = UserLike> {
  users: U[];
  hierarchyTree: HierarchyNode[];
  loading: boolean;
  hierarchyLoading: boolean;
  setOrderedUsers: (v: U[] | null) => void;
}

/**
 * Recomputes ordered users based on hierarchy rules.
 * Ensures minimal state updates and stable React behavior.
 */
export default function useUserOrdering<U extends UserLike>({
  users,
  hierarchyTree,
  loading,
  hierarchyLoading,
  setOrderedUsers,
}: Params<U>) {
  const computedOrder = useMemo<U[] | null>(() => {
    // When loading any data, reset ordering state
    if (loading || hierarchyLoading) return null;

    // No users → empty list
    if (!users || users.length === 0) return [];

    // No hierarchy → return users unchanged
    if (!hierarchyTree || hierarchyTree.length === 0) return users;

    // Full hierarchical ordering
    return buildOrderedUsers(
      hierarchyTree as any,
      users as any
    ) as unknown as U[];
  }, [users, hierarchyTree, loading, hierarchyLoading]);

  // Apply computed ordering to external state
  useEffect(() => {
    setOrderedUsers(computedOrder);
  }, [computedOrder, setOrderedUsers]);

  return computedOrder;
}
