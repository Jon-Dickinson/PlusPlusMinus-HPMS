/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

const mockUseAuth = vi.fn();
vi.mock('../../../context/AuthContext', () => ({ useAuth: () => mockUseAuth() }));

import ViewerCard from '../ViewerCard';

describe('ViewerCard', () => {
  beforeEach(() => mockUseAuth.mockReset());

  it('shows audit button for admin users', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'ADMIN' } });
    renderWithProviders(<ViewerCard viewer={{ id: 2, firstName: 'V', lastName: 'L', username: 'v', role: 'VIEWER' }} />);

    expect(screen.getByTitle('Audit logs')).toBeInTheDocument();
  });

  it('hides audit button for non-admin users', () => {
    mockUseAuth.mockReturnValue({ user: { role: 'MAYOR' } });
    renderWithProviders(<ViewerCard viewer={{ id: 2, firstName: 'V', lastName: 'L', username: 'v', role: 'VIEWER' }} />);

    expect(screen.queryByTitle('Audit logs')).not.toBeInTheDocument();
  });
});
