import React, { Suspense, useCallback, useState } from 'react';
import AuditLogModal from '../components/molecules/AuditLogModal';

export default function useAuditModal(initialUserId?: number | null) {
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState<number | null | undefined>(initialUserId ?? null);

  const open = useCallback((id?: number | string, e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (id !== undefined) setUserId(Number(id));
    setShow(true);
  }, []);

  const close = useCallback(() => setShow(false), []);

  const renderModal = show && userId ? (
    <Suspense fallback={<div />}>
      <AuditLogModal isOpen={true} userId={Number(userId)} onClose={close} />
    </Suspense>
  ) : null;

  return { show, userId, open, close, renderModal };
}
