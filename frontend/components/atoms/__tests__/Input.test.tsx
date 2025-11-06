/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Input from '../Input';

describe('Input', () => {
  it('renders with placeholder', () => {
    renderWithProviders(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    renderWithProviders(<Input value="test" onChange={handleChange} />);
    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports different input types', () => {
    renderWithProviders(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('handles disabled state', () => {
    renderWithProviders(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
  });

  it('applies correct styling', () => {
    renderWithProviders(<Input placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveStyle('background: #ffffff');
    expect(input).toHaveStyle('border: 1px solid #a8a8a8ff');
    expect(input).toHaveStyle('min-height: 38px');
  });
});