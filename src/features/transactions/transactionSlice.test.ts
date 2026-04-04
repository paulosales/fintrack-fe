import { describe, it, expect, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer, { fetchTransactions } from './transactionSlice';
import type { TransactionFilters } from './types';

describe('transactionSlice async thunk', () => {
  it('fetches data successfully', async () => {
    const mockData = {
      success: true,
      data: [
        {
          id: 1,
          accountId: 123,
          transactionTypeName: 'Income',
          categories: 'Groceries',
          datetime: '2026-04-03 00:00:00',
          amount: 100,
          description: 'Test',
          note: 'note',
          fingerprint: 'abc',
        },
      ],
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    const store = configureStore({
      reducer: { transactions: transactionsReducer },
    });

    await store.dispatch(
      fetchTransactions({ accountId: null, transactionTypeId: null, categoryId: null } as TransactionFilters)
    );

    expect(store.getState().transactions.data).toEqual(mockData.data);
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

    const store = configureStore({ reducer: { transactions: transactionsReducer } });
    await store.dispatch(
      fetchTransactions({ accountId: null, transactionTypeId: null, categoryId: null } as TransactionFilters)
    );

    expect(store.getState().transactions.data).toEqual([]);
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

    const store = configureStore({ reducer: { transactions: transactionsReducer } });
    await store.dispatch(
      fetchTransactions({ accountId: null, transactionTypeId: null, categoryId: null } as TransactionFilters)
    );

    expect(store.getState().transactions.data).toEqual([]);
    expect(store.getState().transactions.error).toBe('HTTP 500: Internal server error');
    expect(store.getState().transactions.loading).toBe(false);
  });
});
