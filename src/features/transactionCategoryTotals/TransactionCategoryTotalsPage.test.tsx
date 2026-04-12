import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen, fireEvent } from '@testing-library/react';
import categoriesReducer, { type CategoriesState } from '../categories/categoriesSlice';
import transactionCategoryTotalsReducer from './transactionCategoryTotalsSlice';
import authReducer from '../auth/authSlice';
import TransactionCategoryTotalsPage from './TransactionCategoryTotalsPage';
import type { TransactionCategoryTotalsState } from './types';
import { defaultPagination } from '../../types/pagination';

interface TestState {
  categories: CategoriesState;
  transactionCategoryTotals: TransactionCategoryTotalsState;
}

const renderWithStore = (state: TestState) => {
  const store = configureStore({
    reducer: {
      categories: categoriesReducer,
      transactionCategoryTotals: transactionCategoryTotalsReducer,
      auth: authReducer,
    },
    preloadedState: state,
  });

  return render(
    <Provider store={store}>
      <TransactionCategoryTotalsPage />
    </Provider>
  );
};

describe('TransactionCategoryTotalsPage', () => {
  it('renders totals rows', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                year: 2026,
                month: 4,
                monthLabel: '2026-04',
                categoryId: 1,
                category: 'Groceries',
                totalAmount: -100,
              },
            ],
            pagination: {
              page: 1,
              pageSize: 10,
              totalCount: 1,
              totalPages: 1,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [], pagination: defaultPagination }),
        })
    );

    renderWithStore({
      categories: { loading: false, error: null, data: [{ id: 1, name: 'Groceries' }] },
      transactionCategoryTotals: {
        loading: false,
        error: null,
        data: [],
        detailsByKey: {},
        pagination: defaultPagination,
      },
    });

    expect(await screen.findByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('-$100.00')).toBeInTheDocument();
  });

  it('expands a row and shows fetched details', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                year: 2026,
                month: 4,
                monthLabel: '2026-04',
                categoryId: 1,
                category: 'Groceries',
                totalAmount: -100,
              },
            ],
            pagination: {
              page: 1,
              pageSize: 10,
              totalCount: 1,
              totalPages: 1,
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [], pagination: defaultPagination }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 10,
                type: 'transaction',
                year: 2026,
                month: 4,
                monthLabel: '2026-04',
                description: 'Market',
                datetime: '2026-04-03 13:45:00',
                note: 'weekly',
                categoryId: 1,
                category: 'Groceries',
                amount: -100,
              },
            ],
          }),
        })
    );

    renderWithStore({
      categories: { loading: false, error: null, data: [{ id: 1, name: 'Groceries' }] },
      transactionCategoryTotals: {
        loading: false,
        error: null,
        data: [],
        detailsByKey: {},
        pagination: defaultPagination,
      },
    });

    fireEvent.click(await screen.findByLabelText('Expand row'));

    expect(await screen.findByText('Market')).toBeInTheDocument();
    expect(screen.getByText('2026-04-03 13:45:00')).toBeInTheDocument();
    expect(screen.getByText('weekly')).toBeInTheDocument();
  });
});
