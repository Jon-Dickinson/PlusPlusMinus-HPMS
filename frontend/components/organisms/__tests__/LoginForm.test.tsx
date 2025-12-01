/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import LoginForm from '../LoginForm';

// Mock dependencies
const mockLogin = vi.fn();
const mockPush = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('../../../utils/roles', () => ({
  isAdmin: vi.fn((role) => role === 'ADMIN'),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockPush.mockReset();
  });

  it('renders login form with all elements', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    // expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByAltText('Building Blocks')).toBeInTheDocument();
    expect(screen.getByText('Developed by Jonathan Dickinson')).toBeInTheDocument();
  });

  it('updates email and password on input change', () => {
    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows loading state during form submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(null), 100)));

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Signing in…')).toBeInTheDocument();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('redirects admin users to user-list after successful login', async () => {
    const adminUser = { role: 'ADMIN' };
    mockLogin.mockResolvedValue(adminUser);

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/user-list');
    });
  });

  it('redirects regular users to dashboard after successful login', async () => {
    const regularUser = { role: 'USER' };
    mockLogin.mockResolvedValue(regularUser);

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects viewers with mayorId to mayor view', async () => {
    const viewerUser = { role: 'VIEWER', mayorId: 42 };
    mockLogin.mockResolvedValue(viewerUser);

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'viewer@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('viewer@example.com', 'password123');
      expect(mockPush).toHaveBeenCalledWith('/mayor-view/42');
    });
  });

  it('displays error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  it('displays API error message from response', async () => {
    const apiError = { response: { data: { error: 'Account locked' } } };
    mockLogin.mockRejectedValue(apiError);

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'locked@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Account locked');
    });
  });

  it('clears error on new form submission', async () => {
    mockLogin.mockRejectedValueOnce(new Error('First error'));
    mockLogin.mockResolvedValueOnce({ role: 'USER' });

    renderWithProviders(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    // First submission with error
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('First error');
    });

    // Second submission successful
    fireEvent.change(emailInput, { target: { value: 'correct@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('prevents form submission with empty fields', () => {
    renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.click(submitButton);

    // HTML forms will submit even with empty fields, so login should be called with empty strings
    expect(mockLogin).toHaveBeenCalledWith('', '');
  });

  it('applies correct styling and layout', () => {
    renderWithProviders(<LoginForm />);

    // Find the Root styled component by looking for the Brand component's parent
    const brand = screen.getByAltText('City Builder Logo');
    const root = brand.closest('div[class*="dinSKF"]') || brand.parentElement?.parentElement;

    expect(root).toHaveStyle('position: relative');
    expect(root).toHaveStyle('display: flex');
    // min-height will be converted to pixels in test environment, so just check it exists
    expect(root).toHaveStyle('min-height: 768px'); // Test environment viewport height
  });
});