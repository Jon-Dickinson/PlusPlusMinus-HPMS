/// <reference types="vitest" />
import React from 'react';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach } from 'vitest';

const mockGet = vi.fn();
vi.mock('../../../lib/axios', () => ({ default: { instance: { get: (...args: any[]) => mockGet(...args) } } }));

import MayorCard from '../MayorCard';

describe('MayorCard', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('renders mayor data when API returns a mayor', async () => {
    const mayor = { id: 1, firstName: 'Alice', lastName: 'Anderson', city: { name: 'ZedTown', country: 'X' }, notes: [{ id: 1 }] };
    mockGet.mockResolvedValue({ data: mayor });

    const onClick = vi.fn();
    renderWithProviders(<MayorCard id={1} onClick={onClick} />);

    await waitFor(() => expect(screen.getByText(/Alice Anderson/)).toBeInTheDocument());
    expect(screen.getByText(/ZedTown, X/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Mayor Alice Anderson'));
    expect(onClick).toHaveBeenCalledWith(1);
  });

  it('shows placeholders when API fails', async () => {
    mockGet.mockRejectedValue(new Error('fail'));
    renderWithProviders(<MayorCard id={2} />);

    await waitFor(() => expect(screen.getByText('—, —')).toBeInTheDocument());
    expect(screen.getByText('— —')).toBeInTheDocument();
  });
});
