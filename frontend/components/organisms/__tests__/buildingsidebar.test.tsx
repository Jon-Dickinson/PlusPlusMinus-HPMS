import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';

const mockGetAllowed = vi.fn();
const mockGetEffective = vi.fn();

vi.mock('../../../lib/hierarchyAPI', () => ({
  HierarchyAPI: {
    getAllowedBuildings: (id: number) => mockGetAllowed(id),
    getEffectivePermissions: (id: number) => mockGetEffective(id),
  }
}));

// Stub the draggable building to avoid pulling in react-dnd in unit tests
vi.mock('../DraggableBuilding', () => ({
  __esModule: true,
  default: ({ building }: any) => <div aria-label={building.name} aria-disabled={building.disabled ? 'true' : null} />,
}));

vi.mock('../../../context/AuthContext', () => ({ useAuth: () => ({ user: { id: 99, role: 'ADMIN' } }) }));

import BuildingSidebar from '../BuidlingSidebar/BuildingSidebar';

describe('BuildingSidebar admin-view disables based on directCanBuild', () => {
  beforeEach(() => {
    mockGetAllowed.mockReset();
    mockGetEffective.mockReset();
  });

  it('dims commercial building when admin views a mayor with directCanBuild=false', async () => {
    // allowed buildings (viewer/admin list) returns both categories
    mockGetAllowed.mockResolvedValue([
      { categoryId: 1, categoryName: 'Commercial', buildings: [{ id: 101, name: 'Commercial Complex' }] },
      { categoryId: 2, categoryName: 'Residential', buildings: [{ id: 102, name: 'Residential Housing' }] },
    ]);

    // subject effective permissions: directCanBuild false for commercial, true for residential
    mockGetEffective.mockResolvedValue([
      { categoryId: 1, categoryName: 'commercial', directCanBuild: false, effectiveCanBuild: false },
      { categoryId: 2, categoryName: 'residential', directCanBuild: true, effectiveCanBuild: true },
    ]);

    renderWithProviders(<BuildingSidebar subjectUserId={2} />);

    // wait for sidebar to render
    await waitFor(() => expect(screen.getByLabelText('Commercial Complex')).toBeInTheDocument());

    const commercial = screen.getByLabelText('Commercial Complex');
    const residential = screen.getByLabelText('Residential Housing');

    expect(commercial.getAttribute('aria-disabled')).toBe('true');
    expect(residential.getAttribute('aria-disabled')).toBeNull();
  });
});
