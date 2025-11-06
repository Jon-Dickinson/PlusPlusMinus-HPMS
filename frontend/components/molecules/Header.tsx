import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

const Root = styled.header`
  position: relative;
  width: 100%;
  min-height: 80px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 25px;
`;

const Info = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const Heading = styled.div`
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
`;

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const titleForPath = (path: string) => {
    if (path.startsWith('/user-list')) return 'User List';
    if (path.startsWith('/user-notes')) return 'Notes';
    if (path.startsWith('/building-analysis')) return 'Building Analysis';
    if (path.startsWith('/builder')) return 'Builder';
    // default to dashboard
    return 'City Builder';
  };
  const heading = titleForPath(router.pathname || '');
  return (
    <Root>
      <Left>
        <Heading>{heading}</Heading>
      </Left>
      <Info>
        {user ? (
          <>
            <Heading>
              {user.firstName || user.lastName
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : user.username || user.email || 'User'}
            </Heading>
            <Heading>{user.role || 'USER'}</Heading>
            <Icon src="/user.svg" alt="User" />
          </>
        ) : (
          <div>Guest</div>
        )}
      </Info>
    </Root>
  );
}

const Icon = styled.img`
  height: 36px;
  width: auto;
  display: block;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;
