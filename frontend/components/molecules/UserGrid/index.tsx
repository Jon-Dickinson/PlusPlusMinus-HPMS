import React, { useCallback } from 'react';
import MayorCard from '../MayorCard';
import ViewerCard from '../ViewerCard';
import {
  DataGrid,
  GridHeader,
  MayorGrid,
  HeadingRow,
  HeadingLabel,
  HeadingLabelRight,
  HeaderTitle,
  Message,
} from './styles';
import Spinner from '../../atoms/Spinner';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  mayorId?: number;
  hierarchyId?: number;
  hierarchy?: {
    id: number;
    name: string;
    level: number;
  };
  city?: {
    name: string;
    country: string;
    qualityIndex?: number;
  };
}

interface UserGridProps {
  loading: boolean;
  mayors: User[];
  users: User[];
  canNavigateAdmin: boolean;
  onMayorClick: (id: number | string) => void;
  onDeleteUser?: (userId: number | string) => void;
}

const UserGrid = React.memo(function UserGrid({
  loading,
  mayors,
  users,
  canNavigateAdmin,
  onMayorClick,
  onDeleteUser,
}: UserGridProps) {
  const handleMayorClick = useCallback((id: number | string) => {
    if (canNavigateAdmin) {
      onMayorClick(id);
    }
  }, [canNavigateAdmin, onMayorClick]);

  return (
    <DataGrid>
      <GridHeader>
        <HeaderTitle>Mayors and Viewers</HeaderTitle>
        <HeadingRow>
          <HeadingLabel>Location</HeadingLabel>
          <HeadingLabel>Mayor</HeadingLabel>
          <HeadingLabel>Quality Index</HeadingLabel>
          <HeadingLabelRight>Action</HeadingLabelRight>
        </HeadingRow>
      </GridHeader>

      <MayorGrid>
        {loading ? (
          <Message aria-live="polite">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Spinner size={20} />
              <div>Loading users…</div>
            </div>
          </Message>
        ) : mayors.length === 0 ? (
          <Message>No mayors found.</Message>
        ) : (
          mayors.map((mayor, mayorIndex) => {
            const viewers = users.filter(
              (user) => user.role === 'VIEWER' && user.mayorId === mayor.id,
            );

            return (
              <React.Fragment key={mayor.id}>
                <MayorCard
                  id={mayor.id}
                  mayorData={mayor}
                  onClick={handleMayorClick}
                  onDelete={onDeleteUser}
                />
                {viewers.map((viewer, viewerIndex) => (
                  <ViewerCard
                    key={viewer.id}
                    viewer={viewer}
                    onDeleteUser={onDeleteUser}
                  />
                ))}
              </React.Fragment>
            );
          })
        )}
      </MayorGrid>
    </DataGrid>
  );
});

export default UserGrid;