import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { isAdmin, isMayor } from '../../utils/roles';
import Authorized from '../atoms/Authorized';

const Sidebar = styled.nav`
  width: 80px;
  min-width: 80px;
  background: #111d3a;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
`;

const NavIcons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding-top: 5px;
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
  display: block;
  margin-bottom: 15px;
`;

const Icon = styled.img`
  height: 40px;
  width: auto;
  display: block;
  opacity: ${(p: { active?: boolean }) => (p.active ? 1 : 0.7)};
  filter: ${(p: { active?: boolean }) => (p.active ? 'none' : 'grayscale(60%)')};
  transition: opacity 0.15s ease, filter 0.15s ease;
`;

const ExitButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-top: auto;
  margin-bottom: 1rem;

  img:hover {
    opacity: 1;
  }
`;

export default function GlobalNav() {
  const router = useRouter();
  const isActive = (path: string) => router.pathname === path;
  const { user, logout } = useAuth();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <Sidebar>
      <NavIcons>
    
        <Logo src="/logo.svg" alt="City Builder" />
        
        <Authorized predicate={(u) => !isAdmin(u.role) && u.role !== 'VIEWER'}>
          <Link href="/dashboard" aria-label="Dashboard">
            <Icon src="/builder.svg" alt="Builder" active={isActive('/dashboard')} />
          </Link>
        </Authorized>

        
        <Authorized predicate={(u) => u.role === 'VIEWER' || isAdmin(u.role)}>
        
          {((role === 'VIEWER' && user?.mayorId) || role !== 'VIEWER') ? (
            (() => {
              const mayorHref = user?.mayorId
                ? `/mayor-view/${user.mayorId}`
                : (router.asPath && router.asPath.startsWith('/mayor-view') ? router.asPath : '/user-list');
              return (
                <Link href={mayorHref} aria-label="Mayor View">
                  <Icon src="/city.svg" alt="Mayor View" active={router.asPath.startsWith('/mayor-view')} />
                </Link>
              );
            })()
          ) : null}
        </Authorized>

        <Authorized predicate={(u) => !isMayor(u.role) && u.role !== 'VIEWER'}>
          <Link href="/user-list" aria-label="User List">
            <Icon src="/list.svg" alt="User List" active={isActive('/user-list')} />
          </Link>
        </Authorized>
 
        <Link href="/building-analysis" aria-label="Components">
          <Icon src="/component.svg" alt="Component" active={isActive('/building-analysis')} />
        </Link>
      
      </NavIcons>
      <ExitButton onClick={handleLogout}>
        <Icon src="/logout.svg" alt="Logout" />
      </ExitButton>
    </Sidebar>
  );
}
