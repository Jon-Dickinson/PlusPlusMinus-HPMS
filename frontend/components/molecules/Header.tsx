import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Root = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 1000;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #111111;
`;

const Info = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <Root>
      <Logo src="/logo.svg" alt="PlusPlusMinus" />
      <Info>
        {user ? (
          <>
            <div>{user.name}</div>
            <div style={{ color: '#6B7280' }}>{user.roles?.map((r) => r.role.name).join(', ')}</div>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <div>Guest</div>
        )}
      </Info>
    </Root>
  );
}

const Logo = styled.img`
  height: 40px;
  width: auto;
  display: block;
`;
