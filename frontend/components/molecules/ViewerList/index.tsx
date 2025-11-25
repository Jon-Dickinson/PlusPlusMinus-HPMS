import React from 'react';
import { Trash2 } from 'lucide-react';
import {
  ViewersList,
  ViewersTitle,
  ViewerItem,
  ViewerDeleteButton,
} from './styles';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  mayorId?: number;
}

interface ViewerListProps {
  viewers: User[];
  onDeleteUser?: (userId: number | string) => void;
}

export default function ViewerList({ viewers, onDeleteUser }: ViewerListProps) {
  if (viewers.length === 0) return null;

  return (
    <ViewersList>
      
      {viewers.map((viewer) => (
        <ViewerItem key={viewer.id}>
          <span>
            {viewer.firstName} {viewer.lastName} ({viewer.username})
          </span>
          {onDeleteUser && (
            <ViewerDeleteButton title="Delete" onClick={() => onDeleteUser(viewer.id)}>
              <Trash2 size={14} />
            </ViewerDeleteButton>
          )}
        </ViewerItem>
      ))}
    </ViewersList>
  );
}