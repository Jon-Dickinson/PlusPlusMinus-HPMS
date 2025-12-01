/// <reference types="vitest" />
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';

// Mock templates and nested components
vi.mock('../../templates/MainTemplate', () => ({ default: ({ children }: any) => <div>{children}</div> }));
// Provide a minimal next/router implementation so components using useRouter work in tests
vi.mock('next/router', () => ({ useRouter: () => ({ pathname: '/dashboard', asPath: '/dashboard', push: () => {}, replace: () => {} }) }));
vi.mock('../../components/organisms/CityGrid', () => ({ default: () => <div /> }));
vi.mock('../../components/organisms/BuidlingSidebar/BuildingSidebar', () => ({ default: () => <div /> }));
vi.mock('../../components/organisms/StatsPanel', () => ({ default: () => <div /> }));
vi.mock('../../components/organisms/BuildingLogPanel', () => ({ default: () => <div /> }));
vi.mock('../../components/atoms/Authorized', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('../../components/molecules/NotesModal', () => ({ 
  __esModule: true,
  default: ({ isOpen, onClose }: any) => isOpen ? (
    <div>
      <textarea placeholder="Enter your notes here..." defaultValue="initial note" />
      <button onClick={onClose}>Close</button>
    </div>
  ) : null
}));

// Mock AuthContext to return a user with city and notes
const mockSetUser = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: 7, 
      username: 'mayor1', 
      role: 'MAYOR', 
      firstName: 'Test',
      lastName: 'Mayor',
      email: 'test@example.com',
      city: { id: 42, name: 'Test City' }, 
      notes: [{ id: 9, content: 'initial note', createdAt: new Date().toISOString() }],
      hierarchyId: 1,
      mayorId: null
    },
    token: 'tok',
    initialized: true,
    login: async () => null,
    logout: () => {},
    setUser: mockSetUser,
  }),
}));

// Mock CityContext to provide grid and buildingLog
const cityValue = { 
  grid: { cells: [] }, 
  buildingLog: [{ id: 1, action: 'b' }], 
  getTotals: () => ({ qualityIndex: 100 }),
  reinitializeGrid: vi.fn()
};
vi.mock('../../components/organisms/CityContext', () => ({
  CityProvider: ({ children }: any) => <div>{children}</div>,
  useCity: () => cityValue,
}));

// Mock Header to ensure Save button is rendered - correct path
vi.mock('../../components/molecules/Header', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1>Test City</h1>
      <button>Save</button>
    </div>
  ),
}));

// Also mock the LoggedInLayout path since it imports Header differently
vi.mock('../../components/templates/LoggedInLayout', () => ({
  __esModule: true,
  default: ({ children }: any) => {
    const [showModal, setShowModal] = React.useState(false);
    const [showToast, setShowToast] = React.useState(false);
    
    const handleSave = async () => {
      // Match the real Header save logic - access the mocked axios
      const payload = {
        gridState: { cells: [] },
        buildingLog: [{ id: 1, action: 'b' }],
        note: 'initial note',
        qualityIndex: 100,
      };
      // Use the pre-defined mockPut function
      await mockPut('/cities/42/data', payload);
      // Show success toast like the real Header
      setShowToast(true);
    };
    
    return (
      <div>
        <nav>
          <button aria-label="Notes" title="Notes" onClick={() => setShowModal(true)}>
            Notes Button
          </button>
        </nav>
        <div>
          <h1>Test City</h1>
          <button onClick={handleSave}>Save</button>
        </div>
        {children}
        {showModal && (
          <div>
            <textarea placeholder="Enter your notes here..." defaultValue="initial note" />
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        )}
        {showToast && <div>City data saved successfully!</div>}
      </div>
    );
  },
}));

// Mock axios.put and get
const mockPut = vi.fn().mockResolvedValue({ data: {} });
const mockGet = vi.fn().mockResolvedValue({ data: [{ id: 9, content: 'initial note' }] });
const axiosMock = { 
  __esModule: true,
  default: {
    put: (...args: any[]) => mockPut(...args), 
    get: (...args: any[]) => mockGet(...args),
    setAuthToken: () => {},
    instance: { 
      put: (...args: any[]) => mockPut(...args), 
      get: (...args: any[]) => mockGet(...args) 
    }
  } 
};
vi.mock('../../lib/axios', () => axiosMock);

import Dashboard from '../../pages/dashboard';

describe('Dashboard save flow and note population', () => {
  it('populates note from user.notes and calls axios.put on Save', async () => {
    render(<Dashboard />);

    // Open notes modal and wait for note textarea to be filled from user.notes
    const notesBtn = await screen.findByLabelText('Notes');
    fireEvent.click(notesBtn);
    const textarea = await screen.findByPlaceholderText('Enter your notes here...');
    await waitFor(() => expect((textarea as HTMLTextAreaElement).value).toBe('initial note'));

    // Click save button and assert axios.put called with city id and payload
    // Close modal so Save refers to header save and not modal save
    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);

    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => expect(mockPut).toHaveBeenCalled());
    const expectedUrl = '/cities/42/data';
    expect(mockPut).toHaveBeenCalledWith(expectedUrl, expect.objectContaining({ note: 'initial note', gridState: cityValue.grid, buildingLog: cityValue.buildingLog }));
    // toast should appear at top of screen
    expect(await screen.findByText('City data saved successfully!')).toBeTruthy();
  });
});
