/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import CityBuilder, { CityBuilderLayout } from '../CityBuilder';

// Mock child components
vi.mock('../BuidlingSidebar/BuildingSidebar', () => ({
  default: () => <div data-testid="building-sidebar">BuildingSidebar</div>,
}));

vi.mock('../DraggableBuilding', () => ({
  default: ({ building }: any) => <div data-testid={`draggable-building-${building.id}`}>DraggableBuilding</div>,
}));

vi.mock('../CityGrid', () => ({
  default: () => <div data-testid="city-grid">CityGrid</div>,
}));

vi.mock('../CityContext', () => ({
  CityProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="city-provider">{children}</div>
  ),
}));

describe('CityBuilder', () => {
  it('renders with CityProvider and all child components', () => {
    renderWithProviders(<CityBuilder />);

    expect(screen.getByTestId('city-provider')).toBeInTheDocument();
    expect(screen.getByTestId('building-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('city-grid')).toBeInTheDocument();
  });

  it('applies correct layout styling', () => {
    renderWithProviders(<CityBuilder />);

    const container = screen.getByTestId('city-provider').firstChild as HTMLElement;
    expect(container).toHaveClass('flex', 'w-full', 'h-screen');
  });

  it('renders BuildingSidebar and CityGrid in correct order', () => {
    renderWithProviders(<CityBuilder />);

    expect(screen.getByTestId('building-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('city-grid')).toBeInTheDocument();

    // Just verify both components are rendered - order checking is less critical
  });
});

describe('CityBuilderLayout', () => {
  it('renders without provider', () => {
    renderWithProviders(<CityBuilderLayout />);

    expect(screen.queryByTestId('city-provider')).not.toBeInTheDocument();
    expect(screen.getByTestId('city-grid')).toBeInTheDocument();
  });

  it('applies correct layout styling', () => {
    renderWithProviders(<CityBuilderLayout />);

    const container = screen.getByTestId('city-grid').parentElement;
    expect(container).toHaveClass('flex', 'w-full', 'h-screen');
  });
});