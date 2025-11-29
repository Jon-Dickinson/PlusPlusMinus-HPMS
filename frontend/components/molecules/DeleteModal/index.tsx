import React from 'react';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

type Props = {
  isOpen: boolean;
  deleteTarget: { id: number; name: string; role: string } | null;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

export default function DeleteModal({ isOpen, deleteTarget, onConfirm, onCancel }: Props) {
  return <DeleteConfirmationModal isOpen={isOpen} deleteTarget={deleteTarget} onConfirm={onConfirm} onCancel={onCancel} />;
}
