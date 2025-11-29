import React, { Suspense, useCallback, useMemo, useState } from 'react';
import PermissionsModal from '../components/molecules/PermissionsModal';

export default function usePermissionsModal(initialUserId?: number | null) {
  // Normalize to null
  const [userId, setUserId] = useState<number | null>(initialUserId ?? null);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Opens the modal for a given user ID
   */
  const open = useCallback(
    (id?: number | string, e?: React.MouseEvent) => {
      e?.stopPropagation?.();

      if (id !== undefined && id !== null) {
        const numericId = Number(id);
        if (!Number.isNaN(numericId)) {
          setUserId(numericId);
        }
      }

      setIsOpen(true);
    },
    []
  );

  /**
   * Close modal
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Render memoized modal component
   */
  const renderModal = useMemo(() => {
    if (!isOpen || userId == null) return null;

    return (
      <Suspense fallback={<div />}>
        <PermissionsModal
          isOpen={true}
          userId={userId}
          onClose={close}
        />
      </Suspense>
    );
  }, [isOpen, userId, close]);

  return {
    isOpen,
    userId,
    open,
    close,
    renderModal,
  };
}
