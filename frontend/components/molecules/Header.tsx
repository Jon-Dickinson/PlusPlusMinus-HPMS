import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
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
  gap: 12px;
  align-items: center;
`;

const Heading = styled.div`
  color: #ffffff;
  font-size: 32px;
  font-weight: 500;
`;

export default function Header() {
  const { user, logout } = useAuth();
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
            <div>{user.name}</div>
            <div style={{ color: '#6B7280' }}>{user.roles?.map((r) => r.role.name).join(', ')}</div>
            <Icon src="/user.svg" alt="User" />

            <Icon src="/logout.svg" alt="Logout" onClick={logout} />
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

const NavLink = styled(Link)`
  color: #0068ff;
  font-weight: 600;
  text-decoration: none;
  padding: 6px 8px;
  border-radius: 4px;
  &:hover {
    background: #f3f4f6;
  }
` as unknown as typeof Link;
