import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';

const mockGetEffective = vi.fn();
vi.mock('../../../lib/hierarchyAPI', () => ({ default: { getEffectivePermissions: (id: number) => mockGetEffective(id) } }));
vi.mock('../../../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 99, role: 'ADMIN' } }) }));

import PermissionsModal from '../PermissionsModal';

describe('PermissionsModal display rules (always full opacity)', () => {
  beforeEach(() => {
    mockGetEffective.mockReset();
  });

  it('always shows rows at full opacity when admin views another user', async () => {
    const payload = [
      { categoryId: 101, categoryName: 'commercial', effectiveCanBuild: false, directCanBuild: false },
      { categoryId: 102, categoryName: 'residential', effectiveCanBuild: true, directCanBuild: true }
    ];

    mockGetEffective.mockResolvedValue(payload);

    renderWithProviders(<PermissionsModal isOpen={true} userId={2} onClose={() => {}} />);

    await waitFor(() => expect(screen.getByText('commercial')).toBeInTheDocument());

    const commercialCategory = screen.getByText('commercial');
    const residentialCategory = screen.getByText('residential');

    // both should exist
    expect(commercialCategory).toBeTruthy();
    expect(residentialCategory).toBeTruthy();

    // find nearest ancestor with data-dimmed attribute (our PermissionRow)
    const commercialRow = commercialCategory.closest('[data-dimmed]') as HTMLElement;
    const residentialRow = residentialCategory.closest('[data-dimmed]') as HTMLElement;

    expect(commercialRow).toBeTruthy();
    expect(residentialRow).toBeTruthy();

    // the modal must always show full opacity, so the data-dimmed attribute
    // should be false for all rows
    expect(commercialRow.getAttribute('data-dimmed')).toBe('false');
    expect(residentialRow.getAttribute('data-dimmed')).toBe('false');
  });
});
