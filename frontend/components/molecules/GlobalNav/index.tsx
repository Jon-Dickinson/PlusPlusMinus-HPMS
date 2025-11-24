import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin, isMayor } from '../../../utils/roles';
import Authorized from '../../atoms/Authorized';
import { Sidebar, NavIcons, Logo, Icon, ExitButton } from './styles';
import NotesModal from '../NotesModal';

export default function GlobalNav() {
  const router = useRouter();
  const isActive = (path: string) => router.pathname === path;
  const { user, logout } = useAuth();
  const role = user?.role;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [showNotesModal, setShowNotesModal] = React.useState(false);

  return (
    <Sidebar>
      <NavIcons>
    
        <Logo src="/logo.svg" alt="City Builder" />
        
        <Authorized predicate={(user) => !isAdmin(user.role) && user.role !== 'VIEWER'}>
          <Link href="/dashboard" aria-label="Dashboard">
            <Icon src="/builder.svg" alt="Builder" active={isActive('/dashboard')} />
          </Link>
        </Authorized>

        
        <Authorized predicate={(user) => user.role === 'VIEWER' || isAdmin(user.role)}>
        
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

        {/* Show the User List link for Admins and Mayors (Viewers don't get access) */}
        <Authorized predicate={(user) => user.role !== 'VIEWER'}>
          <Link href="/user-list" aria-label="User List">
            <Icon src="/list.svg" alt="User List" active={isActive('/user-list')} />
          </Link>
        </Authorized>
 
        <Link href="/building-analysis" aria-label="Components">
          <Icon src="/component.svg" alt="Component" active={isActive('/building-analysis')} />
        </Link>

        <Authorized predicate={(user) => isMayor(user.role)}>
          <button
            aria-label="Notes"
            onClick={() => setShowNotesModal(true)}
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            title="Notes"
          >
            <Icon src="/notes.svg" alt="Notes" active={isActive('/notes')} />
          </button>
        </Authorized>
        
        {showNotesModal && (
          <NotesModal isOpen={showNotesModal} onClose={() => setShowNotesModal(false)} />
        )}
      
      </NavIcons>
      <ExitButton onClick={handleLogout}>
        <Icon src="/logout.svg" alt="Logout" />
      </ExitButton>
    </Sidebar>
  );
}
