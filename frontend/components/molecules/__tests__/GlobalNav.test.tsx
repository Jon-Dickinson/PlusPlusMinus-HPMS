/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
const mockUseAuth = vi.fn();
const mockUseRouter = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUseAuth(),
    logout: mockLogout,
  }),
}));

vi.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}));

vi.mock('../../../utils/roles', () => ({
  isAdmin: vi.fn((role) => role === 'ADMIN'),
  isMayor: vi.fn((role) => role === 'MAYOR'),
}));

// Mock axios used by NotesModal so tests do not hit network
const mockAxiosGet = vi.fn().mockResolvedValue({ data: [] });
const mockAxiosPut = vi.fn().mockResolvedValue({ data: {} });
vi.mock('../../../lib/axios', () => ({ default: { instance: { get: (...args: any[]) => mockAxiosGet(...args), put: (...args: any[]) => mockAxiosPut(...args) }, setAuthToken: () => {} } }));

import GlobalNav from '../GlobalNav';

describe('GlobalNav', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseRouter.mockReset();
    mockLogout.mockReset();
  });

  it('renders logo', () => {
    mockUseAuth.mockReturnValue({ role: 'ADMIN' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.getByAltText('City Builder')).toBeInTheDocument();
  });

  it('shows dashboard link for non-admin, non-viewer users', () => {
    mockUseAuth.mockReturnValue({ role: 'MAYOR' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.getByAltText('Builder')).toBeInTheDocument();
  });

  it('hides dashboard link for admin and viewer users', () => {
    mockUseAuth.mockReturnValue({ role: 'ADMIN' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.queryByAltText('Builder')).not.toBeInTheDocument();
  });

  it('shows mayor view link for viewers with mayorId', () => {
    mockUseAuth.mockReturnValue({ role: 'VIEWER', mayorId: 1 });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.getByAltText('Mayor View')).toBeInTheDocument();
  });

  it('shows user list link for non-mayor, non-viewer users', () => {
    mockUseAuth.mockReturnValue({ role: 'ADMIN' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.getByAltText('User List')).toBeInTheDocument();
  });

  it('always shows building analysis link', () => {
    mockUseAuth.mockReturnValue({ role: 'USER' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.getByAltText('Component')).toBeInTheDocument();
  });

  it('shows logout button', () => {
    mockUseAuth.mockReturnValue({ role: 'ADMIN' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.getByAltText('Logout')).toBeInTheDocument();
  });

  it('handles logout', () => {
    mockUseAuth.mockReturnValue({ role: 'ADMIN' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/', push: vi.fn() });
    renderWithProviders(<GlobalNav />);
    const logoutButton = screen.getByAltText('Logout').parentElement;
    fireEvent.click(logoutButton!);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('highlights active links', () => {
    mockUseAuth.mockReturnValue({ role: 'ADMIN' });
    mockUseRouter.mockReturnValue({ pathname: '/building-analysis', asPath: '/building-analysis' });
    renderWithProviders(<GlobalNav />);
    const componentIcon = screen.getByAltText('Component');
    expect(componentIcon).toHaveStyle('opacity: 1');
  });

  it('shows notes icon for mayors and opens the notes modal', async () => {
    // mock a mayor user with id so NotesModal can fetch
    mockUseAuth.mockReturnValue({ role: 'MAYOR', id: 7 });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });

    // configure axios mocks for this test
    mockAxiosGet.mockReset();
    mockAxiosPut.mockReset();
    mockAxiosGet.mockResolvedValue({ data: [{ id: 11, content: 'my note' }] });
    mockAxiosPut.mockResolvedValue({ data: { id: 11, content: 'updated' } });

    renderWithProviders(<GlobalNav />);

    // notes icon should be visible
    const notesButton = screen.getByTitle('Notes');
    expect(notesButton).toBeInTheDocument();

    // clicking should open the modal and fetch notes
    fireEvent.click(notesButton!);

    const textarea = await screen.findByPlaceholderText('Enter your notes here...');
    expect(textarea).toBeInTheDocument();
    expect(mockAxiosGet).toHaveBeenCalledWith('/notes/7');
  });

  it('hides notes icon for non-mayor users', () => {
    mockUseAuth.mockReturnValue({ role: 'ADMIN' });
    mockUseRouter.mockReturnValue({ pathname: '/', asPath: '/' });
    renderWithProviders(<GlobalNav />);
    expect(screen.queryByTitle('Notes')).not.toBeInTheDocument();
  });
});