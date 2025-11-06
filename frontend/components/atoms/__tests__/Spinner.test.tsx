/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Spinner from '../Spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    renderWithProviders(<Spinner />);
    const spinner = screen.getByRole('presentation', { hidden: true }); // aria-hidden elements get this role
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveStyle('width: 12px');
    expect(spinner).toHaveStyle('height: 12px');
  });

  it('renders with custom size', () => {
    renderWithProviders(<Spinner size={24} />);
    const spinner = screen.getByRole('presentation', { hidden: true });
    expect(spinner).toHaveStyle('width: 24px');
    expect(spinner).toHaveStyle('height: 24px');
  });

  it('has correct styling', () => {
    renderWithProviders(<Spinner />);
    const spinner = screen.getByRole('presentation', { hidden: true });
    expect(spinner).toHaveStyle('border-radius: 50%');
    expect(spinner).toHaveStyle('border-width: 2px');
    expect(spinner).toHaveStyle('border-style: solid');
    expect(spinner).toHaveStyle('border-top-color: rgba(255, 255, 255, 0.9)');
  });

  it('is aria-hidden', () => {
    renderWithProviders(<Spinner />);
    const spinner = screen.getByRole('presentation', { hidden: true });
    expect(spinner).toHaveAttribute('aria-hidden');
  });
});