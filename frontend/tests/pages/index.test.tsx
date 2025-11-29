/// <reference types="vitest" />
import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

// Mock MainTemplate and LoginForm so the page is lightweight
vi.mock('../../components/templates/MainTemplate', () => ({
  default: ({ children }: any) => <div data-testid="main">{children}</div>,
}));
vi.mock('../../components/organisms/LoginForm', () => ({
  default: () => <div data-testid="login-form">LoginForm</div>,
}));

// DEBUG: log resolved module during test runs to diagnose intermittent failure
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const resolved = require('../../components/organisms/LoginForm');
  // eslint-disable-next-line no-console
  console.log('DEBUG: resolved LoginForm mock type =', typeof resolved?.default);
} catch (e) {
  // eslint-disable-next-line no-console
  console.log('DEBUG: could not require LoginForm at test-resolve time', (e as any)?.message || e);
}

import Home from '../../pages/index';

describe('Index page', () => {
  it('renders LoginForm inside MainTemplate', () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toHaveTextContent('LoginForm');
  });
});
