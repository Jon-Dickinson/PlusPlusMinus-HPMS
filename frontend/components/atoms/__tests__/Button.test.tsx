/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Button from '../Button';

describe('Button', () => {
  it('renders with children', () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    renderWithProviders(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('background: #2D6AFC'); // theme.colors.primary
    expect(button).toHaveStyle('color: white');
  });

  it('handles disabled state', () => {
    renderWithProviders(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveStyle('opacity: 0.6');
    expect(button).toHaveStyle('cursor: not-allowed');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    renderWithProviders(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});