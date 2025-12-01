import React from 'react';
import { Trash2, FileText } from 'lucide-react';
import {
  ViewerCardStyled,
  ViewerLocation,
  ViewerName,
  ViewerQualityIndex,
  ViewerActions,
  Muted,
  DeleteButton,
  PermissionButton,
  AuditButton,
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
  onDeleteUser?: (userId: number | string) => void;
}

import { useAuth } from '../../../context/AuthContext';
import { isAdmin } from '../../../utils/roles';
import useAuditModal from '../../../hooks/useAuditModal';

export default function ViewerCard({ viewer, onDeleteUser }: ViewerCardProps) {
  const { user: currentUser } = useAuth();
  const viewerIsAdmin = isAdmin(currentUser?.role);
  const { open: openAudit, renderModal: renderAuditModal } = useAuditModal(viewer.id);
  // Viewers are read-only — no permissions modal or edit available
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteUser && onDeleteUser(viewer.id);
  };

  const handleAuditClick = (e: React.MouseEvent) => {
    openAudit(viewer.id, e);
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
        {viewerIsAdmin && (
          <AuditButton onClick={handleAuditClick} title="Audit logs">
            <FileText size={16} />
          </AuditButton>
        )}
        {/* viewers cannot edit permissions; remove the permissions button */}
        {onDeleteUser && (
          <DeleteButton onClick={handleDelete} title="Delete">
            <Trash2 size={16} />
          </DeleteButton>
        )}
        {renderAuditModal}
      </ViewerActions>

      {/* no permissions modal for viewers */}
    </ViewerCardStyled>
  );
}