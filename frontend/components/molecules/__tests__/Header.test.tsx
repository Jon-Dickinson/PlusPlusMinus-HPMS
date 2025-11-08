/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock useAuth and useRouter
const mockUseAuth = vi.fn();
const mockUseRouter = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}));

import Header from '../Header';

describe('Header', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseRouter.mockReset();
  });

  it('renders user info when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { firstName: 'John', lastName: 'Doe', role: 'ADMIN', username: 'johndoe' }
    });
    mockUseRouter.mockReturnValue({ pathname: '/dashboard' });

    renderWithProviders(<Header />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByAltText('User')).toBeInTheDocument();
  });

  it('shows username when no first/last name', () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'testuser', role: 'USER' }
    });
    mockUseRouter.mockReturnValue({ pathname: '/dashboard' });

    renderWithProviders(<Header />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('shows Guest when no user', () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseRouter.mockReturnValue({ pathname: '/dashboard' });

    renderWithProviders(<Header />);
    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  it('displays correct page titles', () => {
    mockUseAuth.mockReturnValue({ user: null });

    const testCases = [
      { path: '/user-list', expected: 'User List' },
      { path: '/building-analysis', expected: 'Building Analysis' },
      { path: '/dashboard', expected: 'City Builder' },
      { path: '/unknown', expected: 'City Builder' },
    ];

    testCases.forEach(({ path, expected }) => {
      mockUseRouter.mockReturnValue({ pathname: path });
      const { unmount } = renderWithProviders(<Header />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });
});