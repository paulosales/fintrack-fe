import { describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import budgetReducer, { fetchBudgetMonthTotals, generateBudgets } from './budgetSlice';
import { defaultPagination } from '../../types/pagination';

describe('budgetSlice', () => {
  it('fetches month totals successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            year: 2026,
            month: 4,
            monthLabel: '2026-04',
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
    });

    vi.stubGlobal('fetch', fetchMock);

    const store = configureStore({ reducer: { budgets: budgetReducer } });
    await store.dispatch(fetchBudgetMonthTotals({ page: 1, pageSize: 10 }));

    expect(fetchMock).toHaveBeenCalledWith('/api/budgets?page=1&page_size=10');
    expect(store.getState().budgets.data).toHaveLength(1);
    expect(store.getState().budgets.pagination.page).toBe(1);
    expect(store.getState().budgets.error).toBeNull();
  });

  it('handles HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal error',
      })
    );

    const store = configureStore({ reducer: { budgets: budgetReducer } });
    await store.dispatch(fetchBudgetMonthTotals({ page: 1, pageSize: 10 }));

    expect(store.getState().budgets.data).toEqual([]);
    expect(store.getState().budgets.pagination).toEqual(defaultPagination);
    expect(store.getState().budgets.error).toBe('HTTP 500: Internal error');
  });

  it('sends the future-only generation option in the payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, createdCount: 3 }),
    });

    vi.stubGlobal('fetch', fetchMock);

    const store = configureStore({ reducer: { budgets: budgetReducer } });
    await store.dispatch(
      generateBudgets({
        endDate: '2026-12-31',
        generateOnlyForFuture: true,
      })
    );

    expect(fetchMock).toHaveBeenCalledWith('/api/budgets/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endDate: '2026-12-31',
        generateOnlyForFuture: true,
      }),
    });
  });
});
