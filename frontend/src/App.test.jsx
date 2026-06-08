import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const item = {
  _id: '1',
  name: 'Mechanical Keyboard',
  category: 'Electronics',
  price: 89.99,
  description: 'Compact wireless keyboard with tactile switches.',
  imageUrl: '',
  warrantyTerms: '1 year manufacturer warranty',
  createdAt: '2026-06-08T12:00:00.000Z'
};

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App', () => {
  it('renders item cards returned by the API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [item]
    });

    render(<App />);

    expect(screen.getByText('Loading your inventory')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument());
    expect(screen.getAllByText('$89.99')).toHaveLength(2);
    expect(screen.getByText('1 year manufacturer warranty')).toBeInTheDocument();
  });

  it('navigates to the add item form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => []
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(screen.getByRole('heading', { name: 'Add Item' })).toBeInTheDocument();
    expect(screen.getByLabelText('Item name')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/add-item');
  });
});
