/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import MapView from '../MapView';

describe('MapView', () => {
  const mockRendered = [
    {
      p: { id: 1, buildingId: 2, gx: 0, gy: 0 },
      b: { name: 'Building 1', file: '/building1.png' },
      isoX: 10,
      isoY: 20,
    },
    {
      p: { id: 2, buildingId: 3, gx: 1, gy: 1 },
      b: { name: 'Building 2', file: '/building2.png' },
      isoX: 30,
      isoY: 40,
    },
  ];
  const mockOnSelect = vi.fn();

  it('renders grid cells', () => {
    renderWithProviders(
      <MapView
        gridCols={3}
        gridRows={3}
        areaW={300}
        areaH={300}
        rendered={[]}
        onSelect={mockOnSelect}
      />
    );
    // Should render 9 cells (3x3 grid)
    const cells = document.querySelectorAll('[data-testid="grid-cells"] > div');
    expect(cells).toHaveLength(9);
  });

  it('renders building markers', () => {
    renderWithProviders(
      <MapView
        gridCols={3}
        gridRows={3}
        areaW={300}
        areaH={300}
        rendered={mockRendered}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.getByAltText('Building 1')).toBeInTheDocument();
    expect(screen.getByAltText('Building 2')).toBeInTheDocument();
  });

  it('handles marker clicks', () => {
    renderWithProviders(
      <MapView
        gridCols={3}
        gridRows={3}
        areaW={300}
        areaH={300}
        rendered={mockRendered}
        onSelect={mockOnSelect}
      />
    );
    const marker = screen.getByTitle('Building 1');
    fireEvent.click(marker);
    expect(mockOnSelect).toHaveBeenCalledWith(mockRendered[0].p);
  });

  it('applies scale transformation', () => {
    renderWithProviders(
      <MapView
        gridCols={3}
        gridRows={3}
        areaW={300}
        areaH={300}
        rendered={[]}
        onSelect={mockOnSelect}
        scale={1.5}
      />
    );
    const scaleContainer = document.querySelector('[data-testid="scale-container"]');
    expect(scaleContainer).toHaveStyle('transform: translate(-50%,-50%) scale(1.5)');
  });

  it('renders grid overlay', () => {
    renderWithProviders(
      <MapView
        gridCols={3}
        gridRows={3}
        areaW={300}
        areaH={300}
        rendered={[]}
        onSelect={mockOnSelect}
      />
    );
    const overlay = document.querySelector('[data-testid="grid-overlay"]');
    expect(overlay).toHaveStyle('background-image: url("/grid.svg")');
  });

  it('renders placement bounds', () => {
    renderWithProviders(
      <MapView
        gridCols={3}
        gridRows={3}
        areaW={300}
        areaH={300}
        rendered={[]}
        onSelect={mockOnSelect}
      />
    );
    const bounds = document.querySelector('[data-testid="placement-bounds"]');
    expect(bounds).toHaveStyle('width: 100%');
    expect(bounds).toHaveStyle('height: 100%');
    expect(bounds).toHaveStyle('border: 1px solid red');
  });

  it('handles empty rendered array', () => {
    renderWithProviders(
      <MapView
        gridCols={3}
        gridRows={3}
        areaW={300}
        areaH={300}
        rendered={[]}
        onSelect={mockOnSelect}
      />
    );
    expect(screen.queryByAltText(/Building/)).not.toBeInTheDocument();
  });
});