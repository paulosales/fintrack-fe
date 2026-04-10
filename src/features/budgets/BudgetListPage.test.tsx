import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import accountsReducer, { type AccountsState } from '../accounts/accountsSlice';
import budgetReducer from './budgetSlice';
import BudgetListPage from './BudgetListPage';
import type { BudgetState } from './types';
import { defaultPagination } from '../../types/pagination';

interface TestState {
  accounts: AccountsState;
  budgets: BudgetState;
}

const renderWithStore = (state: TestState) => {
  const store = configureStore({
    reducer: {
      accounts: accountsReducer,
      budgets: budgetReducer,
    },
    preloadedState: state,
  });

  return render(
    <Provider store={store}>
      <BudgetListPage />
    </Provider>
  );
};

describe('BudgetListPage', () => {
  it('renders budget month totals', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
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
        })
    );

    renderWithStore({
      accounts: {
        loading: false,
        error: null,
        data: [{ id: 1, code: 'CHK', name: 'Checking', accountTypeId: 1 }],
      },
      budgets: {
        loading: false,
        error: null,
        data: [],
        detailsByKey: {},
        pagination: defaultPagination,
      },
    });

    expect(await screen.findByText('2026-04')).toBeInTheDocument();
    expect(screen.getByText('-$100.00')).toBeInTheDocument();
  });

  it('expands a month and shows budget details', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
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
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 10,
                budgetSetupId: 5,
                accountId: 1,
                accountCode: 'CHK',
                accountName: 'Checking',
                date: '2026-04-16',
                amount: -100,
                description: 'Insurance',
                processed: false,
                note: 'Monthly bill',
                isRepeatle: true,
                repeatFrequency: 'MONTHLY',
              },
            ],
          }),
        })
    );

    renderWithStore({
      accounts: {
        loading: false,
        error: null,
        data: [{ id: 1, code: 'CHK', name: 'Checking', accountTypeId: 1 }],
      },
      budgets: {
        loading: false,
        error: null,
        data: [],
        detailsByKey: {},
        pagination: defaultPagination,
      },
    });

    fireEvent.click(await screen.findByLabelText('Expand row'));

    expect(await screen.findByText('Insurance')).toBeInTheDocument();
    expect(screen.getByText('CHK - Checking')).toBeInTheDocument();
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
    expect(screen.getByText('Monthly bill')).toBeInTheDocument();
  });

  it('opens generate dialog with future-only enabled by default', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [], pagination: defaultPagination }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [], pagination: defaultPagination }),
        })
    );

    renderWithStore({
      accounts: {
        loading: false,
        error: null,
        data: [{ id: 1, code: 'CHK', name: 'Checking', accountTypeId: 1 }],
      },
      budgets: {
        loading: false,
        error: null,
        data: [],
        detailsByKey: {},
        pagination: defaultPagination,
      },
    });

    await screen.findByText('No budgets found.');
    fireEvent.click(screen.getByRole('button', { name: 'Generate Budgets' }));

    const formatYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1);
    const lastOfThreeMonthsAhead = new Date(
      threeMonthsAhead.getFullYear(),
      threeMonthsAhead.getMonth() + 1,
      0
    );

    const dialog = screen.getByRole('dialog', { name: 'Generate Budgets' });
    const inputs = dialog.querySelectorAll('input[type="date"]');
    expect(inputs[0]).toHaveValue(formatYMD(firstOfThisMonth));
    expect(inputs[1]).toHaveValue(formatYMD(lastOfThreeMonthsAhead));
  });
});
