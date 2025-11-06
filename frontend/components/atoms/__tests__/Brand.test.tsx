/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRouter } from 'next/router';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import Brand from '../Brand';

describe('Brand', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders logo and text', () => {
    renderWithProviders(<Brand />);
    expect(screen.getByAltText('City Builder Logo')).toBeInTheDocument();
    expect(screen.getByText('ity Builder')).toBeInTheDocument();
  });

  it('navigates to home on click', () => {
    renderWithProviders(<Brand />);
    const brand = screen.getByAltText('City Builder Logo').parentElement;
    fireEvent.click(brand!);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('has correct styling', () => {
    renderWithProviders(<Brand />);
    const container = screen.getByAltText('City Builder Logo').parentElement;
    expect(container).toHaveStyle('position: absolute');
    expect(container).toHaveStyle('top: 30px');
    expect(container).toHaveStyle('left: 10px');
  });
});