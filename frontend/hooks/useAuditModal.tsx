import React, { Suspense, useCallback, useMemo, useState } from 'react';
import AuditLogModal from '../components/molecules/AuditLogModal';

export default function useAuditModal(initialUserId?: number | null) {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize to null
  const [userId, setUserId] = useState<number | null>(
    initialUserId ?? null
  );

  /**
   * OPEN MODAL
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
   * CLOSE MODAL
   */
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * RENDER MODAL (memoized)
   */
  const renderModal = useMemo(() => {
    if (!isOpen || userId == null) return null;

    return (
      <Suspense fallback={<div />}>
        <AuditLogModal
          isOpen={true}
          userId={userId}
          onClose={close}
        />
      </Suspense>
    );
  }, [isOpen, userId, close]);

  return {
    show: isOpen,
    userId,
    open,
    close,
    renderModal,
  };
}
