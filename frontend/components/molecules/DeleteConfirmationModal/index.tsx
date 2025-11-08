import React from 'react';
import {
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalMessage,
  ModalButtons,
  CancelButton,
  DeleteButton,
} from './styles';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  deleteTarget: {
    id: number;
    name: string;
    role: string;
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  deleteTarget,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen || !deleteTarget) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Confirm Delete</ModalTitle>
        <ModalMessage>
          Are you sure you want to delete {deleteTarget.role === 'MAYOR' ? 'Mayor' : 'Viewer'}{' '}
          {deleteTarget.name}?
          {deleteTarget.role === 'MAYOR' && ' This will also delete all associated viewers.'}
        </ModalMessage>
        <ModalButtons>
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
          <DeleteButton onClick={onConfirm}>Delete</DeleteButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
}