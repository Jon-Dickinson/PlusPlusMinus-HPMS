import { useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { HierarchyAPI, useHierarchy } from '../lib/hierarchyAPI';
import type { User } from '../types/user';

export default function useUserList() {
  const { user, initialized } = useAuth();
  const { hierarchyTree, loading: hierarchyLoading } = useHierarchy();

  const [users, setUsers] = useState<User[]>([]);
  const [orderedUsers, setOrderedUsers] = useState<User[] | null>(null);

  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    role: string;
  } | null>(null);

  /**
   * Fetch ALL users (Admin / Viewer)
   */
  const fetchAllUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await axios.instance.get('/users', { signal });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (!signal?.aborted) {
        console.error('Failed to load users:', err);
        setUsers([]);
      }
    }
  }, []);

  /**
   * Fetch subordinate users (Mayor)
   */
  const fetchSubordinates = useCallback(
    async (mayorId: number, signal?: AbortSignal) => {
      try {
        const subs = await HierarchyAPI.getUserSubordinates(mayorId);
        setUsers(Array.isArray(subs) ? subs : []);
      } catch (err) {
        if (!signal?.aborted) {
          console.error('Failed to load subordinate users:', err);
          setUsers([]);
        }
      }
    },
    []
  );

  /**
   * Main initialization
   */
  useEffect(() => {
    if (!initialized) return;

    const controller = new AbortController();

    async function load() {
      setLoading(true);

      if (user?.role === 'MAYOR' && user.id != null) {
        await fetchSubordinates(user.id, controller.signal);
      } else {
        await fetchAllUsers(controller.signal);
      }

      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }

    load();

    return () => controller.abort();
  }, [initialized, user?.role, user?.id, fetchAllUsers, fetchSubordinates]);

  /**
   * Manual refetch
   */
  const refetchUsers = useCallback(async () => {
    setLoading(true);
    await fetchAllUsers(); // Always fetch all for refetch
    setLoading(false);
  }, [fetchAllUsers]);

  /**
   * Memoized return object
   */
  return useMemo(
    () => ({
      // auth
      user,
      initialized,

      // users
      users,
      setUsers,
      orderedUsers,
      setOrderedUsers,

      // loading state
      loading,
      setLoading,

      // refetch
      refetchUsers,

      // delete modal state
      showDeleteModal,
      setShowDeleteModal,
      deleteTarget,
      setDeleteTarget,

      // hierarchy
      hierarchyTree,
      hierarchyLoading,
    }),
    [
      user,
      initialized,
      users,
      orderedUsers,
      loading,
      refetchUsers,
      showDeleteModal,
      deleteTarget,
      hierarchyTree,
      hierarchyLoading,
    ]
  );
}
