/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Row } from '../Blocks';

describe('Row', () => {
  it('renders children', () => {
    renderWithProviders(<Row><div>Test</div></Row>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('applies default justify center', () => {
    renderWithProviders(<Row data-testid="row"><div>Test</div></Row>);
    const row = screen.getByTestId('row');
    expect(row).toHaveStyle('justify-content: center');
  });

  it('applies justify start', () => {
    renderWithProviders(<Row justify="start" data-testid="row"><div>Test</div></Row>);
    const row = screen.getByTestId('row');
    expect(row).toHaveStyle('justify-content: flex-start');
  });

  it('applies justify end', () => {
    renderWithProviders(<Row justify="end" data-testid="row"><div>Test</div></Row>);
    const row = screen.getByTestId('row');
    expect(row).toHaveStyle('justify-content: flex-end');
  });

  it('applies justify between', () => {
    renderWithProviders(<Row justify="between" data-testid="row"><div>Test</div></Row>);
    const row = screen.getByTestId('row');
    expect(row).toHaveStyle('justify-content: space-between');
  });

  it('applies height percentage', () => {
    renderWithProviders(<Row height={50} data-testid="row"><div>Test</div></Row>);
    const row = screen.getByTestId('row');
    expect(row).toHaveStyle('height: 50%');
  });

  it('defaults to auto height', () => {
    renderWithProviders(<Row data-testid="row"><div>Test</div></Row>);
    const row = screen.getByTestId('row');
    expect(row).toHaveStyle('height: auto');
  });
});