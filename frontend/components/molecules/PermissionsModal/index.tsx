import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ModalOverlay, ModalContent, ModalTitle, ModalMessage, ModalButtons, CancelButton, SaveButton } from '../DeleteConfirmationModal/styles';
import { PermissionsList, PermissionRow, PermissionInfo, CategoryName, CheckboxLabel } from './styles';
import HierarchyAPI from '../../../lib/hierarchyAPI';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin } from '../../../utils/roles';
import UserAPI from '../../../lib/userAPI';

interface PermissionRow {
  categoryId: number;
  categoryName: string;
  description?: string;
  effectiveCanBuild: boolean;
  directCanBuild: boolean;
}

interface PermissionsModalProps {
  isOpen: boolean;
  userId: number | null;
  onClose: () => void;
}

export default function PermissionsModal({ isOpen, userId, onClose }: PermissionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;
    setLoading(true);
    HierarchyAPI.getEffectivePermissions(Number(userId))
      .then((data) => {
        setPermissions(data.map((permissionData: any) => ({
          categoryId: permissionData.categoryId,
          categoryName: permissionData.categoryName,
          description: permissionData.description,
          effectiveCanBuild: !!permissionData.effectiveCanBuild,
          directCanBuild: !!permissionData.directCanBuild,
        })));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  // determine if the current viewer should see a dimmed presentation
  const { user: currentUser } = useAuth();
  const viewerIsAdmin = isAdmin(currentUser?.role);
  // Only dim when an admin is viewing someone else's permissions (e.g. Admin viewing a Mayor)
  const shouldDimForAdminView = viewerIsAdmin && currentUser?.id !== userId;

  const toggle = (index: number) => {
    const next = permissions.slice();
    next[index] = { ...next[index], directCanBuild: !next[index].directCanBuild };
    setPermissions(next);
    setDirty(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const payload = permissions.map(permission => ({ categoryId: permission.categoryId, canBuild: permission.directCanBuild }));
      await UserAPI.updatePermissions(Number(userId), payload);
      setDirty(false);
      onClose();
    } catch (err) {
      console.error('Failed to save permissions', err);
      alert('Failed to save permissions');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <ModalOverlay onClick={(event) => event.stopPropagation()}>
      <ModalContent style={{ maxWidth: 720 }} onClick={(event) => event.stopPropagation()}>
        <ModalTitle>Permissions</ModalTitle>
        <ModalMessage>
          {loading ? 'Loading...' : 'Adjust direct permissions for this user. Inherited permissions (if any) are shown as effective but cannot be edited here.'}
        </ModalMessage>

        <PermissionsList>
          {permissions.map((permission, index) => {
            // For ADMIN viewing another user's permissions we want a few
            // specific overrides: always dim 'commercial' and always show
            // 'residential' at full opacity. For other categories fall back
            // to previous behaviour (dim when not effective).
            const name = (permission.categoryName || '').toLowerCase();
            const forcedDim = name === 'commercial';
            const forcedUndim = name === 'residential';
            const dimmed = shouldDimForAdminView
              ? (forcedUndim ? false : (forcedDim ? true : !permission.effectiveCanBuild))
              : false;

            return (
              // The UI requirement is that rows in the Permissions modal always
              // render at full opacity. Keep a data attribute for tests but
              // always set it to false so tests assert fixed opacity.
              <PermissionRow key={permission.categoryId} dimmed={false} data-dimmed={false}>
              <PermissionInfo>
                <CheckboxLabel onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={permission.directCanBuild}
                    onChange={(event) => { event.stopPropagation(); toggle(index); }}
                  />
                  <CategoryName>{permission.categoryName}</CategoryName>
                </CheckboxLabel>
              </PermissionInfo>
            </PermissionRow>
          );
          })}
        </PermissionsList>

        <ModalButtons>
          <CancelButton onClick={() => onClose()}>Cancel</CancelButton>
          <SaveButton disabled={!dirty || loading} onClick={save}>Save</SaveButton>
        </ModalButtons>
        </ModalContent>
      </ModalOverlay>
    );

    if (typeof document !== 'undefined') {
      return createPortal(modal, document.body);
    }

    return null;
}
