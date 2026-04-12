import { describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import budgetSetupReducer, { fetchBudgetSetups } from './budgetSetupSlice';
import authReducer from '../auth/authSlice';

describe('budgetSetupSlice', () => {
  it('fetches budget setups successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: 1,
            accountId: 1,
            accountCode: 'CHK',
            accountName: 'Checking',
            date: '2026-04-16',
            isRepeatle: true,
            repeatFrequency: 'MONTHLY',
            endDate: '2026-12-16',
            description: 'Insurance',
            amount: -100,
            note: 'Monthly',
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

    const store = configureStore({
      reducer: { budgetSetups: budgetSetupReducer, auth: authReducer },
    });
    await store.dispatch(fetchBudgetSetups({ page: 1, pageSize: 10 }));

    expect(fetchMock).toHaveBeenCalledWith('/account/budget-setups?page=1&page_size=10', {
      headers: {},
    });
    expect(store.getState().budgetSetups.data).toHaveLength(1);
    expect(store.getState().budgetSetups.pagination.page).toBe(1);
  });
});
