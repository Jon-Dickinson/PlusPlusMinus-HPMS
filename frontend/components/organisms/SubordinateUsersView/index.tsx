import React from 'react';
import styled from 'styled-components';
import { HierarchyUser } from '../../../types/hierarchy';

interface SubordinateUsersProps {
  subordinates: HierarchyUser[];
  onUserSelect?: (user: HierarchyUser) => void;
  isLoading?: boolean;
}

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  max-height: 500px;
  overflow-y: auto;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const UserGrid = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const UserCard = styled.div`
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #2196f3;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15);
  }
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const UserRole = styled.span<{ role: string }>`
  display: inline-block;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 12px;
  color: white;
  background: ${props => {
    switch (props.role) {
      case 'ADMIN': return '#f44336';
      case 'MAYOR': return '#2196f3';
      case 'VIEWER': return '#4caf50';
      default: return '#757575';
    }
  }};
`;

const UserDetails = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
`;

const DetailLabel = styled.span`
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #888;
`;

const HierarchyInfo = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.85rem;
`;

const HierarchyLevel = styled.span`
  font-weight: 500;
  color: #2196f3;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const SubordinateUsersView: React.FC<SubordinateUsersProps> = ({
  subordinates,
  onUserSelect,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Container>
        <LoadingState>Loading subordinate users...</LoadingState>
      </Container>
    );
  }

  if (!subordinates || subordinates.length === 0) {
    return (
      <Container>
        <Title>Subordinate Users</Title>
        <EmptyState>
          No subordinate users found.
          <br />
          Users at your hierarchy level or below will appear here.
        </EmptyState>
      </Container>
    );
  }

  const handleUserClick = (user: HierarchyUser) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  // Group users by hierarchy level for better organization
  const usersByLevel = subordinates.reduce((acc, user) => {
    const level = user.hierarchy?.level || 0;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(user);
    return acc;
  }, {} as Record<number, HierarchyUser[]>);

  const sortedLevels = Object.keys(usersByLevel).sort((a, b) => Number(a) - Number(b));

  return (
    <Container>
      <Title>Subordinate Users ({subordinates.length})</Title>
      
      {sortedLevels.map(level => (
        <div key={level}>
          <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
            Level {level} ({usersByLevel[Number(level)].length} users)
          </h4>
          <UserGrid>
            {usersByLevel[Number(level)].map((user) => (
              <UserCard key={user.id} onClick={() => handleUserClick(user)}>
                <UserHeader>
                  <UserName>
                    {user.firstName} {user.lastName}
                  </UserName>
                  <UserRole role={user.role}>{user.role}</UserRole>
                </UserHeader>
                
                <UserDetails>
                  <DetailRow>
                    <DetailLabel>Username:</DetailLabel>
                    <DetailValue>{user.username}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Email:</DetailLabel>
                    <DetailValue>{user.email}</DetailValue>
                  </DetailRow>
                </UserDetails>

                {user.hierarchy && (
                  <HierarchyInfo>
                    <div>
                      <strong>Hierarchy:</strong> {user.hierarchy.name}
                    </div>
                    <div>
                      <strong>Level:</strong> <HierarchyLevel>{user.hierarchy.level}</HierarchyLevel>
                    </div>
                  </HierarchyInfo>
                )}
              </UserCard>
            ))}
          </UserGrid>
        </div>
      ))}
    </Container>
  );
};

export default SubordinateUsersView;