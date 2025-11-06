/// <reference types="vitest" />
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';

// Mock templates and nested components
vi.mock('../templates/MainTemplate', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('../components/molecules/GlobalNav', () => ({ default: () => <div /> }));
vi.mock('../components/molecules/Header', () => ({ default: () => <div /> }));
vi.mock('../components/organisms/CityMap', () => ({ default: () => <div /> }));
vi.mock('../components/organisms/BuidlingSidebar/BuildingSidebar', () => ({ default: () => <div /> }));
vi.mock('../components/organisms/StatsPanel', () => ({ default: () => <div /> }));
vi.mock('../components/organisms/BuildingLogPanel', () => ({ default: () => <div /> }));
vi.mock('../components/atoms/Authorized', () => ({ default: ({ children }: any) => <div>{children}</div> }));

// Mock AuthContext to return a user with city and notes
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 7, username: 'mayor1', role: 'MAYOR', city: { id: 42 }, notes: [{ id: 9, content: 'initial note' }] },
    token: 'tok',
    login: async () => null,
    logout: () => {},
    setUser: () => {},
  }),
}));

// Mock CityContext to provide grid and buildingLog
const cityValue = { grid: { cells: [] }, buildingLog: [{ id: 1, action: 'b' }], getTotals: () => ({ qualityIndex: 100 }) };
vi.mock('../components/organisms/CityContext', () => ({
  CityProvider: ({ children }: any) => <div>{children}</div>,
  useCity: () => cityValue,
}));

// Mock axios.put and get
const mockPut = vi.fn().mockResolvedValue({ data: {} });
const mockGet = vi.fn().mockResolvedValue({ data: [] });
vi.mock('../lib/axios', () => ({ default: { instance: { put: (...args: any[]) => mockPut(...args), get: (...args: any[]) => mockGet(...args) }, setAuthToken: () => {} } }));

import Dashboard from '../pages/dashboard';

describe('Dashboard save flow and note population', () => {
  it('populates note from user.notes and calls axios.put on Save', async () => {
    render(<Dashboard />);

    // Wait for note textarea to be filled from user.notes
    const textarea = await screen.findByPlaceholderText('Enter your notes here...');
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toBe('initial note'));

    // Click save button and assert axios.put called with city id and payload
    const saveBtn = screen.getByText('Save City Data');
    fireEvent.click(saveBtn);

    await waitFor(() => expect(mockPut).toHaveBeenCalled());
    const expectedUrl = '/cities/42/data';
    expect(mockPut).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ note: 'initial note', gridState: cityValue.grid, buildingLog: cityValue.buildingLog }));
  });
});
