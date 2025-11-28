/// <reference types="vitest" />
import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('UserList delete buttons visibility', () => {
  it('hides delete buttons for MAYOR role on /user-list', async () => {
    const mockUsers = [
      { id: 1, firstName: 'Alice', lastName: 'Mayor', username: 'alice', role: 'MAYOR' },
      { id: 2, firstName: 'Vera', lastName: 'Viewer', username: 'vera', role: 'VIEWER', mayorId: 1 },
    ];

    vi.resetModules();

    // Layout/stub modules
    vi.doMock('../../templates/MainTemplate', () => ({ default: ({ children }: any) => <div>{children}</div> }));
    vi.doMock('../../components/molecules/GlobalNav', () => ({ default: () => <div /> }));
    vi.doMock('../../components/molecules/Header', () => ({ default: () => <div /> }));
    vi.doMock('../../components/organisms/CityContext', () => ({ CityProvider: ({ children }: any) => <div>{children}</div> }));

    // Router
    vi.doMock('next/router', () => ({ useRouter: () => ({ pathname: '/user-list', push: vi.fn() }) }));

    // Auth context (MAYOR)
    vi.doMock('../../context/AuthContext', () => ({ useAuth: () => ({ user: { role: 'MAYOR' }, token: 'x', initialized: true }) }));

    // useUserList => returns users (mayor+viewer)
    vi.doMock('../../hooks/useUserList', () => ({
      default: () => ({
        user: { id: 1, role: 'MAYOR' },
        initialized: true,
        users: mockUsers,
        orderedUsers: mockUsers,
        setOrderedUsers: () => {},
        loading: false,
        refetchUsers: () => {},
        showDeleteModal: false,
        setShowDeleteModal: () => {},
        deleteTarget: null,
        setDeleteTarget: () => {},
        hierarchyTree: [],
        hierarchyLoading: false,
      }),
    }));

    const { default: UserListView } = await import('../../pages/user-list');

    renderWithProviders(<UserListView />);

    const deleteButtons = screen.queryAllByTitle('Delete');
    expect(deleteButtons.length).toBe(0);
  });

  it('shows delete buttons for ADMIN role on /user-list', async () => {
    const mockUsers = [
      { id: 1, firstName: 'Alice', lastName: 'Mayor', username: 'alice', role: 'MAYOR' },
      { id: 2, firstName: 'Vera', lastName: 'Viewer', username: 'vera', role: 'VIEWER', mayorId: 1 },
    ];

    vi.resetModules();

    vi.doMock('../../templates/MainTemplate', () => ({ default: ({ children }: any) => <div>{children}</div> }));
    vi.doMock('../../components/molecules/GlobalNav', () => ({ default: () => <div /> }));
    vi.doMock('../../components/molecules/Header', () => ({ default: () => <div /> }));
    vi.doMock('../../components/organisms/CityContext', () => ({ CityProvider: ({ children }: any) => <div>{children}</div> }));
    vi.doMock('next/router', () => ({ useRouter: () => ({ pathname: '/user-list', push: vi.fn() }) }));

    // Auth context (ADMIN)
    vi.doMock('../../context/AuthContext', () => ({ useAuth: () => ({ user: { role: 'ADMIN' }, token: 'x', initialized: true }) }));

    // useUserList => returns same users but admin user
    vi.doMock('../../hooks/useUserList', () => ({
      default: () => ({
        user: { id: 1, role: 'ADMIN' },
        initialized: true,
        users: mockUsers,
        orderedUsers: mockUsers,
        setOrderedUsers: () => {},
        loading: false,
        refetchUsers: () => {},
        showDeleteModal: false,
        setShowDeleteModal: () => {},
        deleteTarget: null,
        setDeleteTarget: () => {},
        hierarchyTree: [],
        hierarchyLoading: false,
      }),
    }));

    const { default: UserListView } = await import('../../pages/user-list');

    renderWithProviders(<UserListView />);

    const deleteButtons = screen.queryAllByTitle('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});
