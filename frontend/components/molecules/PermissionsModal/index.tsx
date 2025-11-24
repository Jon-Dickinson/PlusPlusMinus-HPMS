import React, { useEffect, useState } from 'react';
import { ModalOverlay, ModalContent, ModalTitle, ModalMessage, ModalButtons, CancelButton, SaveButton } from '../DeleteConfirmationModal/styles';
import { PermissionsList, PermissionRow, PermissionInfo, CategoryName, CategoryDescription, PermissionActions, CheckboxLabel, DirectLabel, EffectiveText } from './styles';
import HierarchyAPI from '../../../lib/hierarchyAPI';
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
        setPermissions(data.map((d: any) => ({
          categoryId: d.categoryId,
          categoryName: d.categoryName,
          description: d.description,
          effectiveCanBuild: !!d.effectiveCanBuild,
          directCanBuild: !!d.directCanBuild,
        })));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  const toggle = (idx: number) => {
    const next = permissions.slice();
    next[idx] = { ...next[idx], directCanBuild: !next[idx].directCanBuild };
    setPermissions(next);
    setDirty(true);
  };

  const save = async () => {
    setLoading(true);
    try {
      const payload = permissions.map(p => ({ categoryId: p.categoryId, canBuild: p.directCanBuild }));
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

  return (
    <ModalOverlay onClick={(event) => event.stopPropagation()}>
      <ModalContent style={{ maxWidth: 720 }} onClick={(event) => event.stopPropagation()}>
        <ModalTitle>Permissions</ModalTitle>
        <ModalMessage>
          {loading ? 'Loading...' : 'Adjust direct permissions for this user. Inherited permissions (if any) are shown as effective but cannot be edited here.'}
        </ModalMessage>

        <PermissionsList>
          {permissions.map((p, i) => (
            <PermissionRow key={p.categoryId}>
              <PermissionInfo>
                <CategoryName>{p.categoryName}</CategoryName>
                <CategoryDescription>{p.description}</CategoryDescription>
              </PermissionInfo>

              <PermissionActions>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={p.directCanBuild}
                    onChange={(e) => { e.stopPropagation(); toggle(i); }}
                  />
                  <DirectLabel>Direct</DirectLabel>
                </CheckboxLabel>

                <EffectiveText effective={p.effectiveCanBuild}>{p.effectiveCanBuild ? 'Effective' : 'Not Effective'}</EffectiveText>
              </PermissionActions>
            </PermissionRow>
          ))}
        </PermissionsList>

        <ModalButtons>
          <CancelButton onClick={() => onClose()}>Cancel</CancelButton>
          <SaveButton disabled={!dirty || loading} onClick={save}>Save</SaveButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
}
