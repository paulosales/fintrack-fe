import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import CategoriesPage from './CategoriesPage';
import categoriesReducer, { type CategoriesState } from './categoriesSlice';

interface TestState {
  categories: CategoriesState;
}

const renderWithStore = (state: TestState) => {
  const store = configureStore({
    reducer: {
      categories: categoriesReducer,
    },
    preloadedState: state,
  });

  return render(
    <Provider store={store}>
      <CategoriesPage />
    </Provider>
  );
};

describe('CategoriesPage', () => {
  it('renders fetched categories', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 1, name: 'Bills' },
            { id: 2, name: 'Groceries' },
          ],
        }),
      })
    );

    renderWithStore({
      categories: {
        loading: false,
        error: null,
        data: [],
      },
    });

    expect(await screen.findByText('Bills')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('creates a category', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: { id: 3, name: 'Utilities' } }),
        })
    );

    renderWithStore({
      categories: {
        loading: false,
        error: null,
        data: [],
      },
    });

    fireEvent.click(await screen.findByRole('button', { name: /Create Category/i }));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Utilities' } });

    const form = document.getElementById('category-form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(await screen.findByText('Utilities')).toBeInTheDocument();
  });
});