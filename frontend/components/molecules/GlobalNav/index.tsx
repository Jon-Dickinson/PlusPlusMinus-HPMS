import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin, isMayor } from '../../../utils/roles';
import Authorized from '../../atoms/Authorized';
import { Sidebar, NavIcons, Logo, Icon, ExitButton } from './styles';
import NotesModal from '../NotesModal';

const GlobalNav = React.memo(function GlobalNav() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isActive = (path: string) => mounted ? router.pathname === path : false;
  const { user, logout } = useAuth();
  const role = user?.role;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const [showNotesModal, setShowNotesModal] = useState(false);

  const handleShowNotesModal = useCallback(() => {
    setShowNotesModal(true);
  }, []);

  const handleCloseNotesModal = useCallback(() => {
    setShowNotesModal(false);
  }, []);

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
                : (mounted && router.asPath && router.asPath.startsWith('/mayor-view') ? router.asPath : '/user-list');
              return (
                <Link href={mayorHref} aria-label="Mayor View">
                  <Icon src="/city.svg" alt="Mayor View" active={mounted && router.asPath.startsWith('/mayor-view')} />
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
            onClick={handleShowNotesModal}
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
            title="Notes"
          >
            <Icon src="/notes.svg" alt="Notes" active={isActive('/notes')} />
          </button>
        </Authorized>
        
        {showNotesModal && (
          <NotesModal isOpen={showNotesModal} onClose={handleCloseNotesModal} />
        )}
      
      </NavIcons>
      <ExitButton onClick={handleLogout}>
        <Icon src="/logout.svg" alt="Logout" />
      </ExitButton>
    </Sidebar>
  );
});

export default GlobalNav;
