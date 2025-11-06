/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import DetailsPanel from '../DetailsPanel';

describe('DetailsPanel', () => {
  const mockPlacement = { id: 1, buildingId: 2, gx: 10, gy: 20 };
  const mockBuilding = { name: 'Test Building', stats: { health: 100, power: 50 } };
  const mockGetBuilding = vi.fn();

  beforeEach(() => {
    mockGetBuilding.mockReturnValue(mockBuilding);
  });

  it('renders nothing when no selection', () => {
    renderWithProviders(
      <DetailsPanel
        selected={null}
        getBuilding={mockGetBuilding}
        onClose={() => {}}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders building details when selected', () => {
    renderWithProviders(
      <DetailsPanel
        selected={mockPlacement}
        getBuilding={mockGetBuilding}
        onClose={() => {}}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Building')).toBeInTheDocument();
    expect(screen.getByText('Coords: 10, 20')).toBeInTheDocument();
    expect(screen.getByText(/"health": 100/)).toBeInTheDocument();
    expect(screen.getByText(/"power": 50/)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    renderWithProviders(
      <DetailsPanel
        selected={mockPlacement}
        getBuilding={mockGetBuilding}
        onClose={handleClose}
      />
    );
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('handles undefined building', () => {
    mockGetBuilding.mockReturnValue(undefined);
    renderWithProviders(
      <DetailsPanel
        selected={mockPlacement}
        getBuilding={mockGetBuilding}
        onClose={() => {}}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('Test Building')).not.toBeInTheDocument();
    expect(screen.getByText('Coords: 10, 20')).toBeInTheDocument();
    expect(screen.getByText('{}')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    renderWithProviders(
      <DetailsPanel
        selected={mockPlacement}
        getBuilding={mockGetBuilding}
        onClose={() => {}}
      />
    );
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveStyle('position: absolute');
    expect(panel).toHaveStyle('right: 18px');
    expect(panel).toHaveStyle('top: 18px');
    expect(panel).toHaveStyle('width: 320px');
    expect(panel).toHaveStyle('background: rgba(255, 255, 255, 0.98)');
    expect(panel).toHaveStyle('z-index: 30');
  });
});