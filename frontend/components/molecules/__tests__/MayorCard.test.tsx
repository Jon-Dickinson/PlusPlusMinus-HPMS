/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';

const mockGet = vi.fn();
vi.mock('../../../lib/axios', () => ({ default: { instance: { get: (...args: any[]) => mockGet(...args) } } }));

// mock auth context when we need admin checks
const mockUseAuth = vi.fn();
vi.mock('../../../context/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

import MayorCard from '../MayorCard';

describe('MayorCard', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockUseAuth.mockReset();
    // default to no-auth so components that call useAuth don't blow up
    mockUseAuth.mockReturnValue({ user: null, token: null, initialized: true });
  });

  it('renders mayor data when API returns a mayor', async () => {
    const mayor = { id: 1, firstName: 'Alice', lastName: 'Anderson', city: { name: 'ZedTown', country: 'X', qualityIndex: 85 }, notes: [{ id: 1 }] };
    mockGet.mockResolvedValue({ data: mayor });

    const onClick = vi.fn();
    renderWithProviders(<MayorCard id={1} onClick={onClick} />);

    await waitFor(() => expect(screen.getByText(/Alice Anderson/)).toBeInTheDocument());
    expect(screen.getByText(/ZedTown, X/)).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Mayor Alice Anderson'));
    expect(onClick).toHaveBeenCalledWith(1);
  });

  it('shows placeholders when API fails', async () => {
    mockGet.mockRejectedValue(new Error('fail'));
    renderWithProviders(<MayorCard id={2} />);

    await waitFor(() => expect(screen.getByText('—, —')).toBeInTheDocument());
    expect(screen.getByText('— —')).toBeInTheDocument();
  });

  it('shows audit button for ADMIN and opens modal which fetches audits', async () => {
    // mayor data for fetch
    const mayor = { id: 1, firstName: 'Alice', lastName: 'Anderson', city: { name: 'ZedTown', country: 'X', qualityIndex: 85 }, notes: [{ id: 1 }] };

    // configure auth to be admin
    mockUseAuth.mockReturnValue({ user: { id: 999, role: 'ADMIN' }, token: 'x', initialized: true });

    // setup axios get to return mayor data for /users/1 and a simple audits response for /users/1/audits
    mockGet.mockImplementation((path: string) => {
      if (path?.toString().includes('/audits')) return Promise.resolve({ data: { total: 0, items: [] } });
      return Promise.resolve({ data: mayor });
    });

    renderWithProviders(<MayorCard id={1} />);

    // wait for mayor data to show
    await waitFor(() => expect(screen.getByText(/Alice Anderson/)).toBeInTheDocument());

    // audit button should be visible to admins
    const auditButton = screen.getByTitle('Audit logs');
    expect(auditButton).toBeInTheDocument();

    // clicking should open modal with title
    fireEvent.click(auditButton);
    await waitFor(() => expect(screen.getByText(/Audit Logs/)).toBeInTheDocument());
    // audits fetch should have been called for this user
    expect(mockGet).toHaveBeenCalledWith(`/users/1/audits`, { params: { limit: 10, offset: 0 } });
  });
});
