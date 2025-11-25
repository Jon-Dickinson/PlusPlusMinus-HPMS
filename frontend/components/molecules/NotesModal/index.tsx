import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../../lib/axios';
import { useAuth } from '../../../context/AuthContext';
import {
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalButtons,
  CancelButton,
  DeleteButton,
} from '../DeleteConfirmationModal/styles';
import { NotesInput } from '../../atoms/--shared-styles';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotesModal({ isOpen, onClose }: NotesModalProps) {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!user?.id) return;

    let active = true;
    setLoading(true);
    setError(null);

    axios.instance
      .get(`/notes/${user.id}`)
      .then((res) => {
        if (!active) return;
        const notes = Array.isArray(res.data) ? res.data : [];
        setContent(notes.length ? notes[0].content : '');
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed loading notes', err);
        setError('Failed to load notes');
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [isOpen, user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await axios.instance.put(`/notes/${user.id}`, { content });
      const savedNote = res.data;
      // update local auth user notes if possible
      if (setUser && user) {
        const next = { ...user, notes: [savedNote] } as any;
        setUser(next);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save note', err);
      setError('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modal = (
    <ModalOverlay onClick={(event) => event.stopPropagation()}>
      <ModalContent onClick={(event) => event.stopPropagation()}>
        <ModalTitle>Notes</ModalTitle>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <NotesInput
              placeholder="Enter your notes here..."
              value={content}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => { event.stopPropagation(); setContent(event.target.value); }}
            />
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          </div>
        )}

        <ModalButtons>
          <CancelButton onClick={onClose}>Close</CancelButton>
          <DeleteButton onClick={handleSave} disabled={loading || !content.trim()}>{loading ? 'Saving...' : 'Save'}</DeleteButton>
        </ModalButtons>
      </ModalContent>
      </ModalOverlay>
    );

    if (typeof document !== 'undefined') {
      return createPortal(modal, document.body);
    }

    return null;
}
