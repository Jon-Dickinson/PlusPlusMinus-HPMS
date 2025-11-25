import React, { Suspense, useCallback, useState } from 'react';
import PermissionsModal from '../components/molecules/PermissionsModal';

export default function usePermissionsModal(initialUserId?: number | null) {
  const [showPermissions, setShowPermissions] = useState(false);
  const [userId, setUserId] = useState<number | null | undefined>(initialUserId ?? null);

  const open = useCallback((id?: number | string, e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (id !== undefined) setUserId(Number(id));
    setShowPermissions(true);
  }, []);

  const close = useCallback(() => {
    setShowPermissions(false);
  }, []);

  const renderModal = showPermissions && userId ? (
    <Suspense fallback={<div />}>
      <PermissionsModal isOpen={true} userId={Number(userId)} onClose={close} />
    </Suspense>
  ) : null;

  return { showPermissions, userId, open, close, renderModal };
}
