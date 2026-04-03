import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer, { TransactionState } from './transactionSlice';
import accountsReducer, { AccountsState } from '../accounts/accountsSlice';
import TransactionList from './TransactionList';

interface TestState {
  transactions: TransactionState;
  accounts: AccountsState;
}

const renderWithStore = (state: TestState) => {
  const store = configureStore({
    reducer: {
      transactions: transactionsReducer,
      accounts: accountsReducer,
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
    data: [{ id: 123, code: 'CHK-001', name: 'Checking Account', account_type_id: 1 }],
  };

  it('renders empty state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) })
    );
    renderWithStore({
      transactions: { loading: false, error: null, data: [] },
      accounts: mockAccountsState,
    });

    expect(await screen.findByText('No transactions found.')).toBeInTheDocument();
  });

  it('renders data rows', async () => {
    const data = [
      {
        id: 1,
        account_id: 123,
        transaction_type_id: 1,
        datetime: '2026-04-03 00:00:00',
        amount: 100,
        description: 'Purchase test',
        note: 'note',
        fingerprint: 'fp1',
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data }) })
    );
    renderWithStore({
      transactions: { loading: false, error: null, data: [] },
      accounts: mockAccountsState,
    });

    expect(await screen.findByText('Purchase test')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
