/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the axios module used by the AuthContext
const mockPost = vi.fn();
const mockSetAuthToken = vi.fn();

vi.mock('../../lib/axios', () => ({
  default: {
    instance: { post: (...args: any[]) => mockPost(...args) },
    setAuthToken: (...args: any[]) => mockSetAuthToken(...args),
  },
}));

function Consumer() {
  const { user, token, login, logout, setUser } = useAuth();
  return (
    <div>
      <span data-testid="username">{user?.username ?? ''}</span>
      <span data-testid="token">{token ?? ''}</span>
      <button onClick={() => login('a@a.com', 'pw')}>do-login</button>
      <button onClick={() => logout()}>do-logout</button>
      <button onClick={() => setUser(null)}>clear-user</button>
      <button onClick={() => setUser({ id: 3, username: 'same' } as any)}>set-same</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockSetAuthToken.mockReset();
    localStorage.clear();
  });

  it('login stores token and user and calls setAuthToken', async () => {
    const fakeUser = { id: 1, username: 'alice', role: 'MAYOR' } as any;
    mockPost.mockResolvedValue({ data: { token: 'tok-123', user: fakeUser } });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('do-login'));

    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent('alice'));

    // localStorage should have been set
    expect(localStorage.getItem('token')).toBe('tok-123');
    expect(JSON.parse(localStorage.getItem('user') || 'null')).toMatchObject({ username: 'alice' });

    // setAuthToken should have been called
    expect(mockSetAuthToken).toHaveBeenCalledWith('tok-123');
  });

  it('logout clears storage and unsets token', async () => {
    // Pre-populate localStorage
    localStorage.setItem('token', 'tok-xyz');
    localStorage.setItem('user', JSON.stringify({ id: 2, username: 'bob' }));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // Ensure initial values are read from localStorage
    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent('bob'));

    fireEvent.click(screen.getByText('do-logout'));

    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent(''));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockSetAuthToken).toHaveBeenCalledWith(null);
  });

  it('useAuth throws when used outside provider', () => {
    // a component that calls useAuth directly
    const Bad = () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useAuth();
      return null;
    };

    // Suppress console error from React
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });

  it('setUser early-returns when newUser equals oldUser', async () => {
    const sameUser = { id: 3, username: 'same' } as any;
    // pre-populate localStorage with the same user
    localStorage.setItem('user', JSON.stringify(sameUser));

    // spy on setItem to ensure it is NOT called when setUser early-returns
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // clicking the 'set-same' button will call setUser with an object equal to existing localStorage value
    fireEvent.click(screen.getByText('set-same'));

    // ensure setItem was not called (early return)
    expect(setItemSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
  });

  it('handles corrupt localStorage user by ignoring it and keeping token', async () => {
    // Put a valid token and a corrupt user JSON string
    localStorage.setItem('token', 'tok-bad');
    localStorage.setItem('user', '{ this is : not json');

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    // username should be empty because parse failed, but token should be loaded
    await waitFor(() => expect(screen.getByTestId('username')).toHaveTextContent(''));
    expect(mockSetAuthToken).toHaveBeenCalledWith('tok-bad');
  });
});
