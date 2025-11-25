import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  ViewerCardStyled,
  ViewerLocation,
  ViewerName,
  ViewerQualityIndex,
  ViewerActions,
  Muted,
  DeleteButton,
  PermissionButton,
} from './styles';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  mayorId?: number;
}


export interface ViewerCardProps {
  viewer: User;
  onDeleteUser: (userId: number | string) => void;
}

export default function ViewerCard({ viewer, onDeleteUser }: ViewerCardProps) {
  // Viewers are read-only — no permissions modal or edit available
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
        {/* viewers cannot edit permissions; remove the permissions button */}
        <DeleteButton onClick={handleDelete}>
          <Trash2 size={16} />
        </DeleteButton>
      </ViewerActions>

      {/* no permissions modal for viewers */}
    </ViewerCardStyled>
  );
}