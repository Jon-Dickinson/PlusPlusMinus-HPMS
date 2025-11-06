/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import DndShell from '../DndShell';

describe('DndShell', () => {
  it('renders children', () => {
    renderWithProviders(
      <DndShell>
        <div>Test Child</div>
      </DndShell>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    renderWithProviders(
      <DndShell>
        <div>Child 1</div>
        <div>Child 2</div>
      </DndShell>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders with no children', () => {
    renderWithProviders(<DndShell>{null}</DndShell>);
    // Should render without crashing
    expect(document.body).toBeInTheDocument();
  });
});