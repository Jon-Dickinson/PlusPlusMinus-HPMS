/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import RegisterForm from '../RegisterForm';

// Mock dependencies
const mockPost = vi.fn();
const mockGet = vi.fn();
const mockPush = vi.fn();

vi.mock('../../../lib/axios', () => ({
  default: {
    instance: {
      post: (...args: any[]) => mockPost(...args),
      get: (...args: any[]) => mockGet(...args),
    },
  },
}));

vi.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockPush.mockReset();
    // Default mock for mayor fetching - return empty array
    mockGet.mockResolvedValue({ data: [] });
  });

  it('renders registration form with all elements', () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByText('Register as:')).toBeInTheDocument();
    expect(screen.getByLabelText('Viewer')).toBeInTheDocument();
    expect(screen.getByLabelText('Mayor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('defaults to VIEWER role', () => {
    renderWithProviders(<RegisterForm />);

    const viewerRadio = screen.getByLabelText('Viewer');
    const mayorRadio = screen.getByLabelText('Mayor');

    expect(viewerRadio).toBeChecked();
    expect(mayorRadio).not.toBeChecked();
  });

  it('shows mayor selection when VIEWER role is selected', async () => {
    const mockMayors = [
      { id: 1, firstName: 'John', lastName: 'Doe', username: 'johndoe' },
      { id: 2, firstName: 'Jane', lastName: 'Smith', username: 'janesmith' },
    ];
    mockGet.mockResolvedValue({ data: mockMayors });

    renderWithProviders(<RegisterForm />);

    expect(await screen.findByText('Select your Mayor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('-- Select Mayor --')).toBeInTheDocument();
    expect(screen.getByText('John Doe (johndoe)')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith (janesmith)')).toBeInTheDocument();
  });

  it('shows city fields when MAYOR role is selected', () => {
    renderWithProviders(<RegisterForm />);

    const mayorRadio = screen.getByLabelText('Mayor');
    fireEvent.click(mayorRadio);

    expect(screen.getByPlaceholderText('City Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
    expect(screen.queryByText('Select your Mayor')).not.toBeInTheDocument();
  });

  it('clears mayorId when switching from VIEWER to MAYOR', async () => {
    const mockMayors = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
    mockGet.mockResolvedValue({ data: mockMayors });

    renderWithProviders(<RegisterForm />);

    // Select a mayor
    const mayorSelect = await screen.findByDisplayValue('-- Select Mayor --');
    fireEvent.change(mayorSelect, { target: { value: '1' } });
    expect(mayorSelect).toHaveValue('1');

    // Switch to MAYOR role
    const mayorRadio = screen.getByLabelText('Mayor');
    fireEvent.click(mayorRadio);

    // Mayor selection should be hidden
    expect(screen.queryByDisplayValue('-- Select Mayor --')).not.toBeInTheDocument();
  });

  it('updates form data on input changes', () => {
    renderWithProviders(<RegisterForm />);

    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    const usernameInput = screen.getByPlaceholderText('Username');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
    expect(usernameInput).toHaveValue('johndoe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows loading state during form submission', async () => {
    const mockMayors = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
    mockGet.mockResolvedValue({ data: mockMayors });
    mockPost.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderWithProviders(<RegisterForm />);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Select mayor for VIEWER role
    const mayorSelect = await screen.findByDisplayValue('-- Select Mayor --');
    fireEvent.change(mayorSelect, { target: { value: '1' } });

    const submitButton = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(submitButton);

    // Wait for loading state to be set
    await waitFor(() => {
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  it('submits VIEWER registration successfully', async () => {
    const mockMayors = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
    mockGet.mockResolvedValue({ data: mockMayors });
    mockPost.mockResolvedValue({});

    renderWithProviders(<RegisterForm />);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Select mayor
    const mayorSelect = await screen.findByDisplayValue('-- Select Mayor --');
    fireEvent.change(mayorSelect, { target: { value: '1' } });

    const submitButton = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'VIEWER',
        cityName: '',
        country: '',
        mayorId: 1,
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('submits MAYOR registration successfully', async () => {
    mockPost.mockResolvedValue({});

    renderWithProviders(<RegisterForm />);

    // Switch to MAYOR role
    const mayorRadio = screen.getByLabelText('Mayor');
    fireEvent.click(mayorRadio);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('City Name'), { target: { value: 'Springfield' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'USA' } });

    const submitButton = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'MAYOR',
        cityName: 'Springfield',
        country: 'USA',
        mayorId: undefined,
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message on registration failure', async () => {
    const errorMessage = 'Email already exists';
    mockPost.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });

    renderWithProviders(<RegisterForm />);

    // Switch to MAYOR role to avoid mayor selection requirement
    const mayorRadio = screen.getByLabelText('Mayor');
    fireEvent.click(mayorRadio);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('City Name'), { target: { value: 'Springfield' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'USA' } });

    const submitButton = screen.getByRole('button', { name: 'Register' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  it('disables submit button when VIEWER role selected but no mayor chosen', async () => {
    const mockMayors = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
    mockGet.mockResolvedValue({ data: mockMayors });

    renderWithProviders(<RegisterForm />);

    // Fill all fields except mayor selection
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    await screen.findByText('Select your Mayor');

    const submitButton = screen.getByRole('button', { name: 'Register' });
    expect(submitButton).toBeDisabled();
  });

  it('handles mayor fetching errors gracefully', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<RegisterForm />);

    // Wait for mayor loading to complete (which will fail)
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/public/mayors');
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading mayors...')).not.toBeInTheDocument();
    });

    // Should still show the mayor selection area with the select element
    expect(screen.getByText('Select your Mayor')).toBeInTheDocument();
    // The select element should still be rendered even when mayors loading failed
    const mayorSelect = screen.getByDisplayValue('-- Select Mayor --');
    expect(mayorSelect).toBeInTheDocument();
    // Should have no mayor options (only the default option)
    expect(mayorSelect).toHaveLength(1);
  });

  it('clears error on new form submission', async () => {
    mockPost.mockRejectedValueOnce({ response: { data: { error: 'First error' } } });
    mockPost.mockResolvedValueOnce({});

    renderWithProviders(<RegisterForm />);

    // Switch to MAYOR role to avoid mayor selection requirement
    const mayorRadio = screen.getByLabelText('Mayor');
    fireEvent.click(mayorRadio);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('City Name'), { target: { value: 'Springfield' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'USA' } });

    const submitButton = screen.getByRole('button', { name: 'Register' });

    // First submission with error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('First error');
    });

    // Second submission successful
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});