import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionSlice';
import accountsReducer, { AccountsState } from '../accounts/accountsSlice';
import categoriesReducer, { CategoriesState } from '../categories/categoriesSlice';
import transactionTypesReducer, {
  TransactionTypesState,
} from '../transactionTypes/transactionTypesSlice';
import type { TransactionState } from './types';
import TransactionList from './TransactionList';
import { defaultPagination } from '../../types/pagination';

interface TestState {
  transactions: TransactionState;
  accounts: AccountsState;
  categories: CategoriesState;
  transactionTypes: TransactionTypesState;
}

const renderWithStore = (state: TestState) => {
  const store = configureStore({
    reducer: {
      transactions: transactionsReducer,
      accounts: accountsReducer,
      categories: categoriesReducer,
      transactionTypes: transactionTypesReducer,
    },
    preloadedState: state,
  });

  return render(
    <Provider store={store}>
      <TransactionList />
    </Provider>
  );
};

describe('TransactionList', () => {
  const mockAccountsState: AccountsState = {
    loading: false,
    error: null,
    data: [{ id: 123, code: 'CHK-001', name: 'Checking Account', accountTypeId: 1 }],
  };
  const mockTransactionTypesState: TransactionTypesState = {
    loading: false,
    error: null,
    data: [{ id: 1, code: 'INCOME', name: 'Income' }],
  };
  const mockCategoriesState: CategoriesState = {
    loading: false,
    error: null,
    data: [{ id: 1, name: 'Groceries' }],
  };

  it('renders empty state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: [], pagination: defaultPagination }),
      })
    );
    renderWithStore({
      transactions: { loading: false, error: null, data: [], pagination: defaultPagination },
      accounts: mockAccountsState,
      categories: mockCategoriesState,
      transactionTypes: mockTransactionTypesState,
    });

    expect(await screen.findByText('No transactions found.')).toBeInTheDocument();
  });

  it('renders data rows', async () => {
    const data = [
      {
        id: 1,
        accountId: 123,
        transactionTypeName: 'Income',
        categories: 'Groceries, Home',
        datetime: '2026-04-03 00:00:00',
        amount: 100,
        description: 'Purchase test',
        note: 'note',
        fingerprint: 'fp1',
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data, pagination: defaultPagination }),
      })
    );
    renderWithStore({
      transactions: { loading: false, error: null, data: [], pagination: defaultPagination },
      accounts: mockAccountsState,
      categories: mockCategoriesState,
      transactionTypes: mockTransactionTypesState,
    });

    expect(await screen.findByText('Purchase test')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Groceries, Home')).toBeInTheDocument();
    expect(screen.getByText('note')).toBeInTheDocument();
    expect(screen.getByText('2026-04-03 00:00:00')).toBeInTheDocument();
  });
});
