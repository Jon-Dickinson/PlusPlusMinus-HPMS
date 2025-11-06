/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import Authorized from '../Authorized';

describe('Authorized', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders children when user is authenticated and no restrictions', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'USER' } });
    renderWithProviders(<Authorized><div>Content</div></Authorized>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders nothing when no user', () => {
    mockUseAuth.mockReturnValue({ user: null });
    renderWithProviders(<Authorized><div>Content</div></Authorized>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders children when role is allowed', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'ADMIN' } });
    renderWithProviders(<Authorized allowed={['ADMIN']}><div>Content</div></Authorized>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders nothing when role is not allowed', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'USER' } });
    renderWithProviders(<Authorized allowed={['ADMIN']}><div>Content</div></Authorized>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders fallback when provided and not authorized', () => {
    mockUseAuth.mockReturnValue({ user: null });
    renderWithProviders(<Authorized fallback={<div>Fallback</div>}><div>Content</div></Authorized>);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('uses predicate function when provided', () => {
    const predicate = vi.fn().mockReturnValue(true);
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'USER' } });
    renderWithProviders(<Authorized predicate={predicate}><div>Content</div></Authorized>);
    expect(predicate).toHaveBeenCalledWith({ id: 1, role: 'USER' });
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('handles case-insensitive role matching', () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, role: 'admin' } });
    renderWithProviders(<Authorized allowed={['ADMIN']}><div>Content</div></Authorized>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});