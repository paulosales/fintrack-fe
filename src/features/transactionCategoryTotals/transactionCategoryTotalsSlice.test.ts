import { describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import transactionCategoryTotalsReducer, {
  fetchTransactionCategoryTotalDetails,
  fetchTransactionCategoryTotals,
} from './transactionCategoryTotalsSlice';
import authReducer from '../auth/authSlice';
import { defaultPagination } from '../../types/pagination';

describe('transactionCategoryTotalsSlice', () => {
  it('fetches totals successfully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
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
    );

    const store = configureStore({
      reducer: { transactionCategoryTotals: transactionCategoryTotalsReducer, auth: authReducer },
    });

    await store.dispatch(
      fetchTransactionCategoryTotals({
        month: null,
        year: null,
        categoryId: null,
        page: 1,
        pageSize: 10,
      })
    );

    expect(store.getState().transactionCategoryTotals.data).toHaveLength(1);
    expect(store.getState().transactionCategoryTotals.pagination.page).toBe(1);
    expect(store.getState().transactionCategoryTotals.error).toBeNull();
  });

  it('caches detail data by row key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            {
              id: 99,
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

    const store = configureStore({
      reducer: { transactionCategoryTotals: transactionCategoryTotalsReducer, auth: authReducer },
    });

    await store.dispatch(
      fetchTransactionCategoryTotalDetails({ month: 4, year: 2026, categoryId: 1 })
    );

    expect(store.getState().transactionCategoryTotals.detailsByKey['2026-4-1'].data).toHaveLength(
      1
    );
    expect(store.getState().transactionCategoryTotals.pagination).toEqual(defaultPagination);
  });
});
