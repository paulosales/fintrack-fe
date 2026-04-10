import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
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
      transactions: { loading: false, error: null, data: [], detailsByTransactionId: {}, pagination: defaultPagination },
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
        transactionTypeId: 1,
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
      vi
        .fn()
        // accounts
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: [{ id: 123, code: 'CHK-001', name: 'Checking Account', accountTypeId: 1 }],
          }),
        })
        // transaction types
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [{ id: 1, code: 'INCOME', name: 'Income' }] }),
        })
        // categories
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: [{ id: 1, name: 'Groceries' }] }),
        })
        // first call: list transactions
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data, pagination: defaultPagination }),
        })
        // second call: fetch sub-transactions for transaction id 1
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: [
              {
                id: 10,
                transaction_id: 1,
                product_code: 'P1',
                amount: 5.0,
                description: 'Sub item',
                note: null,
              },
            ],
          }),
        })
        // third call: delete sub transaction
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
        // fourth call: fetch sub-transactions after delete returns empty
        .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: [] }) })
    );
    renderWithStore({
      transactions: { loading: false, error: null, data: [], detailsByTransactionId: {}, pagination: defaultPagination },
      accounts: mockAccountsState,
      categories: mockCategoriesState,
      transactionTypes: mockTransactionTypesState,
    });

    expect(await screen.findByText('Purchase test')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Transaction' })).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Groceries, Home')).toBeInTheDocument();
    expect(screen.getByText('note')).toBeInTheDocument();
    expect(screen.getByText('2026-04-03 00:00:00')).toBeInTheDocument();
    expect(screen.getByLabelText('edit transaction 1')).toBeInTheDocument();
    expect(screen.getByLabelText('delete transaction 1')).toBeInTheDocument();
    // expand row
    const expand = screen.getByLabelText('Expand row');
    act(() => {
      expand.click();
    });
    expect(await screen.findByText('Sub item')).toBeInTheDocument();

    // ensure edit/delete buttons present for sub-transaction
    expect(screen.getByLabelText('edit sub 10')).toBeInTheDocument();
    expect(screen.getByLabelText('delete sub 10')).toBeInTheDocument();

    // delete sub transaction
    const delBtn = screen.getByLabelText('delete sub 10');
    // confirm dialog is window.confirm; stub to return true
    const origConfirm = window.confirm;
    
    window.confirm = () => true;
    act(() => {
      delBtn.click();
    });
    // wait for the sub item to be removed
    await waitFor(() => expect(screen.queryByText('Sub item')).not.toBeInTheDocument());
    // restore confirm

    window.confirm = origConfirm;
  });
});
