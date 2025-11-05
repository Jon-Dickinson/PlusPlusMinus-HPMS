import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from '../styles/theme';

export function renderWithProviders(ui: React.ReactElement, options: any = {}) {
  const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper as any, ...options });
}

export default renderWithProviders;
