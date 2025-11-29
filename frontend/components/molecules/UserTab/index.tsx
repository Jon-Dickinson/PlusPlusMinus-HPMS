import React from 'react';
import UserGrid from '../UserGrid';

type Props = {
  loading: boolean;
  isOrdering: boolean;
  mayors: any[];
  users: any[];
  canNavigateAdmin: boolean;
  onMayorClick: (id: number | string) => void;
  onDeleteUser?: (id: number | string) => void;
};

export default function UserTab({ loading, isOrdering, mayors, users, canNavigateAdmin, onMayorClick, onDeleteUser }: Props) {
  return (
    <UserGrid
      loading={loading || isOrdering}
      mayors={mayors}
      users={users}
      canNavigateAdmin={canNavigateAdmin}
      onMayorClick={onMayorClick}
      onDeleteUser={onDeleteUser}
    />
  );
}
