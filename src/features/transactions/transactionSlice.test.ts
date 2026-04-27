import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import type { AppDispatch } from '../../store';
import transactionsReducer, { fetchTransactions } from './transactionSlice';
import authReducer from '../auth/authSlice';
import type { TransactionFilters } from './types';
import { defaultPagination } from '../../types/pagination';

describe('transactionSlice async thunk', () => {
  it('fetches data successfully', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: 1,
          accountId: 123,
          transactionTypeId: 1,
          transactionTypeName: 'Income',
          categories: 'Groceries',
          datetime: '2026-04-03 00:00:00',
          amount: 100,
          description: 'Test',
          note: 'note',
          fingerprint: 'abc',
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1,
      },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    const store = configureStore({
      reducer: { transactions: transactionsReducer, auth: authReducer },
    });

    await (store.dispatch as AppDispatch)(
      fetchTransactions({
        accountId: null,
        transactionTypeId: null,
        categoryId: null,
        description: '',
        page: 1,
        pageSize: 10,
      } as TransactionFilters)
    );

    expect(store.getState().transactions.data).toEqual(mockData.data);
    expect(store.getState().transactions.pagination).toEqual(mockData.pagination);
    expect(store.getState().transactions.loading).toBe(false);
    expect(store.getState().transactions.error).toBe(null);
  });

  it('handles API error response', async () => {
    const mockData = { success: false, error: 'Failed' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    const store = configureStore({
      reducer: { transactions: transactionsReducer, auth: authReducer },
    });
    await (store.dispatch as AppDispatch)(
      fetchTransactions({
        accountId: null,
        transactionTypeId: null,
        categoryId: null,
        description: '',
        page: 1,
        pageSize: 10,
      } as TransactionFilters)
    );

    expect(store.getState().transactions.data).toEqual([]);
    expect(store.getState().transactions.pagination).toEqual(defaultPagination);
    expect(store.getState().transactions.error).toBe('Failed');
    expect(store.getState().transactions.loading).toBe(false);
  });

  it('handles HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      })
    );

    const store = configureStore({
      reducer: { transactions: transactionsReducer, auth: authReducer },
    });
    await (store.dispatch as AppDispatch)(
      fetchTransactions({
        accountId: null,
        transactionTypeId: null,
        categoryId: null,
        description: '',
        page: 1,
        pageSize: 10,
      } as TransactionFilters)
    );

    expect(store.getState().transactions.data).toEqual([]);
    expect(store.getState().transactions.pagination).toEqual(defaultPagination);
    expect(store.getState().transactions.error).toBe('HTTP 500: Internal server error');
    expect(store.getState().transactions.loading).toBe(false);
  });

  it('includes the description filter in the request query', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [], pagination: defaultPagination }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const store = configureStore({
      reducer: { transactions: transactionsReducer, auth: authReducer },
    });
    await (store.dispatch as AppDispatch)(
      fetchTransactions({
        accountId: null,
        transactionTypeId: null,
        categoryId: null,
        description: '  Coffee Shop  ',
        page: 1,
        pageSize: 10,
      } as TransactionFilters)
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/account/transactions?description=Coffee+Shop&page=1&page_size=10',
      { headers: {} }
    );
  });
});
