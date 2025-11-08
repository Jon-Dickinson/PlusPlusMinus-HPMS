import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/router';
import { Root, Info, Heading, Icon, Left } from './styles';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const titleForPath = (path: string) => {
    if (path.startsWith('/user-list')) return 'User List';
    if (path.startsWith('/building-analysis')) return 'Building Analysis';
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