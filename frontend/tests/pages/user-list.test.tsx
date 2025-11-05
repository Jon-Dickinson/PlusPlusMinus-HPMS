/// <reference types="vitest" />
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

// Mock MainTemplate and nested components
vi.mock('../../templates/MainTemplate', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('../../components/molecules/GlobalNav', () => ({ default: () => <div /> }));
vi.mock('../../components/molecules/Header', () => ({ default: () => <div /> }));
vi.mock('../../components/organisms/CityContext', () => ({ CityProvider: ({ children }: any) => <div>{children}</div> }));

// Mock auth context so the page can render
vi.mock('../../context/AuthContext', () => ({ useAuth: () => ({ user: null, token: null, login: async () => null, logout: () => {}, setUser: () => {} }) }));

// Mock axios to return empty list
const mockGet = vi.fn();
vi.mock('../../lib/axios', () => ({ default: { instance: { get: (...args: any[]) => mockGet(...args) } } }));

import UserList from '../../pages/user-list';

describe('UserList page', () => {
  it('shows "No mayors found." when API returns empty', async () => {
    vi.mock('next/router', () => ({ useRouter: () => ({ pathname: '/', push: vi.fn() }) }));
    mockGet.mockResolvedValue({ data: [] });
    renderWithProviders(<UserList />);
    await waitFor(() => expect(screen.getByText(/No mayors found/i)).toBeInTheDocument());
  });
});
