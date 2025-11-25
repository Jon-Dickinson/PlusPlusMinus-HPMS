import { useEffect, useState, useCallback } from 'react';
import axios from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { HierarchyAPI, useHierarchy } from '../../lib/hierarchyAPI';
import type { User } from './user-list.types';

export default function useUserList() {
  const { user, initialized } = useAuth();
  const { hierarchyTree, loading: hierarchyLoading } = useHierarchy();

  const [users, setUsers] = useState<User[]>([]);
  const [orderedUsers, setOrderedUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; role: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.instance.get('/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error('Failed to load users', e);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!initialized) return () => {
      mounted = false;
    };

    (async () => {
      // Not calling access checks here (caller decides where to use hook);
      // previously page logic used auth-level checks so we keep the same behaviour
      if (user?.role === 'MAYOR') {
        try {
          const subs = await HierarchyAPI.getUserSubordinates(user.id);
          if (mounted) setUsers(subs || []);
        } catch (err) {
          console.error('Failed to load subordinate users', err);
          if (mounted) setUsers([]);
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        await fetchUsers();
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [fetchUsers, initialized, user?.role, user?.id]);

  // Expose a function for the consumer to set users (used after refetch/delete)
  const refetchUsers = useCallback(async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  }, [fetchUsers]);

  return {
    user,
    initialized,
    users,
    setUsers,
    orderedUsers,
    setOrderedUsers,
    loading,
    setLoading,
    refetchUsers,
    showDeleteModal,
    setShowDeleteModal,
    deleteTarget,
    setDeleteTarget,
    hierarchyTree,
    hierarchyLoading,
  };
}
