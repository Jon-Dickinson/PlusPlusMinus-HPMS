import { useCallback } from 'react';
import axios from '../lib/axios';

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

export type DeleteTarget = {
  id: number;
  name: string;
  role: string;
} | null;

interface UseDeleteUserOptions {
  displayUsers: UserSummary[];
  deleteTarget: DeleteTarget;
  setDeleteTarget: (t: DeleteTarget) => void;
  setShowDeleteModal: (b: boolean) => void;
  refetchUsers: () => Promise<void> | void;
}

export default function useDeleteUser({
  displayUsers,
  deleteTarget,
  setDeleteTarget,
  setShowDeleteModal,
  refetchUsers,
}: UseDeleteUserOptions) {
  /**
   * Open delete modal for a specific user
   */
  const handleDeleteUser = useCallback(
    (userId: number | string) => {
      const id = Number(userId);
      if (Number.isNaN(id)) return;

      const user = displayUsers.find((u) => u.id === id);
      if (!user) return;

      setDeleteTarget({
        id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      });

      setShowDeleteModal(true);
    },
    [displayUsers, setDeleteTarget, setShowDeleteModal]
  );

  /**
   * Confirm deletion
   */
  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await axios.instance.delete(`/users/${deleteTarget.id}`);
      await refetchUsers();

      // Only close modal on success
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (error: unknown) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  }, [deleteTarget, refetchUsers, setDeleteTarget, setShowDeleteModal]);

  /**
   * Cancel deletion
   */
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  }, [setShowDeleteModal, setDeleteTarget]);

  return {
    handleDeleteUser,
    confirmDelete,
    cancelDelete,
  };
}
