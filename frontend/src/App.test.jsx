import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const item = {
  _id: '1',
  name: 'Mechanical Keyboard',
  category: 'Electronics',
  price: 89.99,
  currency: 'LKR',
  description: 'Compact wireless keyboard with tactile switches.',
  imageUrl: '',
  warrantyTerms: '1 year manufacturer warranty',
  createdAt: '2026-06-08T12:00:00.000Z',
  updatedAt: '2026-06-09T12:00:00.000Z'
};

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
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
    expect(screen.getAllByText(/Rs\s*89\.99/)).toHaveLength(2);
    expect(screen.getByText('1 year manufacturer warranty')).toBeInTheDocument();
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument();
  });

  it('navigates to the add item form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => []
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(screen.getByRole('heading', { name: 'Create Item' })).toBeInTheDocument();
    expect(screen.getByLabelText('Item name')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toHaveValue('LKR');
    expect(window.location.pathname).toBe('/add-item');
  });

  it('duplicates an existing item into a new draft', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [item]
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }));

    expect(screen.getByRole('heading', { name: 'Create Item' })).toBeInTheDocument();
    expect(screen.getByLabelText('Item name')).toHaveValue('Mechanical Keyboard Copy');
    expect(screen.getByLabelText('Currency')).toHaveValue('LKR');
    expect(
      screen.getByText('A duplicate copy was loaded. Review the fields, then save it as a new item.')
    ).toBeInTheDocument();
  });

  it('restores and clears an unsaved draft on the add item page', () => {
    window.localStorage.setItem(
      'item-manager:item-draft',
      JSON.stringify({
        name: 'Saved Draft',
        category: 'Accessories',
        price: '1250',
        currency: 'USD',
        description: 'Draft description',
        imageUrl: '',
        warrantyTerms: ''
      })
    );

    window.history.replaceState({}, '', '/add-item');
    render(<App />);

    expect(screen.getByLabelText('Item name')).toHaveValue('Saved Draft');
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');
    expect(screen.getByText('Your last unsaved draft was restored from this browser.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear saved draft' }));

    expect(screen.getByLabelText('Item name')).toHaveValue('');
    expect(window.localStorage.getItem('item-manager:item-draft')).toBeNull();
  });
});
