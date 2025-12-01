import React, { useCallback } from 'react';
import MayorCard from '../MayorCard';
import ViewerList from '../ViewerList';
import { MayorSection } from './styles';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  mayorId?: number;
}

interface MayorSectionProps {
  mayor: User;
  viewers: User[];
  canNavigateAdmin: boolean;
  onMayorClick: (id: number | string) => void;
  onDeleteUser: (userId: number | string) => void;
}

export default function MayorSectionComponent({
  mayor,
  viewers,
  canNavigateAdmin,
  onMayorClick,
  onDeleteUser,
}: MayorSectionProps) {
  const handleMayorClick = useCallback((id: number | string) => {
    if (canNavigateAdmin) {
      onMayorClick(id);
    }
  }, [canNavigateAdmin, onMayorClick]);

  return (
    <MayorSection>
      <MayorCard
        id={mayor.id}
        onClick={handleMayorClick}
        onDelete={onDeleteUser}
      />
      <ViewerList viewers={viewers} onDeleteUser={onDeleteUser} />
    </MayorSection>
  );
}