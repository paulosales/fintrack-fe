import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import accountsReducer, { type AccountsState } from '../accounts/accountsSlice';
import budgetSetupsReducer from './budgetSetupSlice';
import BudgetSetupListPage from './BudgetSetupListPage';
import type { BudgetSetupState } from './types';
import { defaultPagination } from '../../types/pagination';

interface TestState {
  accounts: AccountsState;
  budgetSetups: BudgetSetupState;
}

const renderWithStore = (state: TestState) => {
  const store = configureStore({
    reducer: {
      accounts: accountsReducer,
      budgetSetups: budgetSetupsReducer,
    },
    preloadedState: state,
  });

  return render(
    <Provider store={store}>
      <BudgetSetupListPage />
    </Provider>
  );
};

describe('BudgetSetupListPage', () => {
  it('renders budget setups', async () => {
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
        })
    );

    renderWithStore({
      accounts: {
        loading: false,
        error: null,
        data: [{ id: 1, code: 'CHK', name: 'Checking', accountTypeId: 1 }],
      },
      budgetSetups: {
        loading: false,
        error: null,
        data: [],
        pagination: defaultPagination,
      },
    });

    expect(await screen.findByText('Insurance')).toBeInTheDocument();
    expect(screen.getByText('CHK - Checking')).toBeInTheDocument();
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
  });
});
