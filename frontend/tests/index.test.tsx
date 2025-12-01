/// <reference types="vitest" />
import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { renderWithProviders } from '../test-utils/renderWithProviders';

// Mock all complex components to avoid dependency issues
vi.mock('../components/templates/MainTemplate', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="main">{children}</div>,
}));

vi.mock('../components/organisms/LoginForm', () => ({
  __esModule: true,
  default: () => <div data-testid="login-form">LoginForm</div>,
}));

// Mock next router for the page
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

import Home from '../pages/index';

describe('Index page', () => {
  it('renders LoginForm inside MainTemplate', () => {
    renderWithProviders(<Home />);
    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toHaveTextContent('LoginForm');
  });
});
