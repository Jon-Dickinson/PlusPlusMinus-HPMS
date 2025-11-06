/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import BuildingMarker from '../BuildingMarker';

describe('BuildingMarker', () => {
  const mockPlacement = { id: 1, buildingId: 2, gx: 10, gy: 20 };
  const mockBuilding = { name: 'Test Building', file: '/test.png' };

  it('renders building image', () => {
    renderWithProviders(
      <BuildingMarker
        p={mockPlacement}
        b={mockBuilding}
        isoX={50}
        isoY={30}
      />
    );
    const img = screen.getByAltText('Test Building');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.png');
  });

  it('uses imgSrc when provided', () => {
    renderWithProviders(
      <BuildingMarker
        p={mockPlacement}
        b={mockBuilding}
        isoX={50}
        isoY={30}
        imgSrc="/custom.png"
      />
    );
    const img = screen.getByAltText('Test Building');
    expect(img).toHaveAttribute('src', '/custom.png');
  });

  it('applies correct positioning', () => {
    renderWithProviders(
      <BuildingMarker
        p={mockPlacement}
        b={mockBuilding}
        isoX={100}
        isoY={50}
      />
    );
    const container = screen.getByTitle('Test Building');
    expect(container).toHaveStyle('left: calc(50% + 100px)');
    expect(container).toHaveStyle('top: 50px');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    renderWithProviders(
      <BuildingMarker
        p={mockPlacement}
        b={mockBuilding}
        isoX={50}
        isoY={30}
        onClick={handleClick}
      />
    );
    const container = screen.getByTitle('Test Building');
    fireEvent.click(container);
    expect(handleClick).toHaveBeenCalledWith(mockPlacement);
  });

  it('has hover effects', () => {
    renderWithProviders(
      <BuildingMarker
        p={mockPlacement}
        b={mockBuilding}
        isoX={50}
        isoY={30}
      />
    );
    const container = screen.getByTitle('Test Building');
    expect(container).toHaveStyle('cursor: pointer');
    expect(container).toHaveStyle('transition: transform 120ms ease,filter 120ms ease');
  });
});