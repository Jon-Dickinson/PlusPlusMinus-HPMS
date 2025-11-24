import React, { useState, Suspense } from 'react';
import { Trash2, Shield } from 'lucide-react';
import {
  ViewerCardStyled,
  ViewerLocation,
  ViewerName,
  ViewerQualityIndex,
  ViewerActions,
  Muted,
  DeleteButton,
} from './styles';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  mayorId?: number;
}

import PermissionsModal from '../PermissionsModal';

export interface ViewerCardProps {
  viewer: User;
  onDeleteUser: (userId: number | string) => void;
}

export default function ViewerCard({ viewer, onDeleteUser }: ViewerCardProps) {
  const [showPermissions, setShowPermissions] = useState(false);

  const openPermissions = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowPermissions(true);
  };

  const closePermissions = () => setShowPermissions(false);
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteUser(viewer.id);
  };

  return (
    <ViewerCardStyled>
      <ViewerLocation>
        <Muted>—</Muted>
      </ViewerLocation>

      <ViewerName>
        <Muted>{viewer.firstName} {viewer.lastName}</Muted>
      </ViewerName>

      <ViewerQualityIndex>
        <Muted>—</Muted>
      </ViewerQualityIndex>

      <ViewerActions>
        <DeleteButton onClick={openPermissions} title="Permissions">
          <Shield size={16} />
        </DeleteButton>
        <DeleteButton onClick={handleDelete}>
          <Trash2 size={16} />
        </DeleteButton>
      </ViewerActions>

      {showPermissions && (
        <Suspense fallback={<div />}>
          <PermissionsModal isOpen={true} userId={viewer.id} onClose={closePermissions} />
        </Suspense>
      )}
    </ViewerCardStyled>
  );
}