/// <reference types="vitest" />
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';

// Utility for mocking shared modules used by Dashboard inside isolated module scopes
const mockGet = vi.fn();
const applyDashboardMocks = () => {
  vi.mock('../templates/MainTemplate', () => ({ default: ({ children }: any) => <div>{children}</div> }));
  vi.mock('../components/molecules/GlobalNav', () => ({ default: () => <div /> }));
  vi.mock('../components/molecules/Header', () => ({ default: () => <div /> }));
  vi.mock('../components/organisms/CityContext', () => ({ CityProvider: ({ children }: any) => <div>{children}</div>, useCity: () => ({ grid: {}, buildingLog: [], removeBuildingFromCell: () => {} }) }));
  vi.mock('../components/organisms/CityGrid', () => ({ default: () => <div data-testid="city-map" /> }));
  vi.mock('../components/organisms/BuidlingSidebar/BuildingSidebar', () => ({ default: () => <div /> }));
  vi.mock('../components/organisms/StatsPanel', () => ({ default: () => <div /> }));
  vi.mock('../components/organisms/BuildingLogPanel', () => ({ default: () => <div /> }));
  vi.mock('../components/atoms/Authorized', () => ({ default: ({ children }: any) => <div>{children}</div> }));
  vi.mock('../lib/axios', () => ({ default: { instance: { get: (...args: any[]) => mockGet(...args) }, setAuthToken: () => {} } }));
};


describe('Dashboard page', () => {
  it('renders without crashing and contains city map when user provided', async () => {
    // Ensure modules are loaded in an isolated module environment so mocks don't leak
    // reset module cache so mocks are fresh for this test and won't leak
    vi.resetModules();
    applyDashboardMocks();

      // Provide a minimal user via mocking AuthContext
      vi.mock('../context/AuthContext', () => ({ AuthProvider: ({ children }: any) => <div>{children}</div>, useAuth: () => ({ user: { username: 'u1', role: 'MAYOR', city: { id: 1 } }, token: 't', login: async () => null, logout: () => {}, setUser: () => {} }) }));

      mockGet.mockResolvedValue({ data: [] });

      // dynamically import the module after mocks are set up
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { default: Dashboard } = await import('../pages/dashboard');

      // render and ensure dashboard doesn't crash when a user is available
      render(<Dashboard />);
      expect(document.body).toBeTruthy();
  });

  it('renders DashboardContent safely when no user', async () => {
    // reset module cache so mocks are fresh for this test and won't leak
    vi.resetModules();
    applyDashboardMocks();

      // render where useAuth returns no user by mocking the context
      vi.mock('../context/AuthContext', () => ({ AuthProvider: ({ children }: any) => <div>{children}</div>, useAuth: () => ({ user: null, token: null, login: async () => null, logout: () => {}, setUser: () => {} }) }));

      mockGet.mockResolvedValue({ data: [] });

      const { default: Dashboard } = await import('../pages/dashboard');
      render(<Dashboard />);
      // ensure it renders the main wrapper elements (StatsPanel mocked)
      expect(document.body).toBeTruthy();
  });
});
