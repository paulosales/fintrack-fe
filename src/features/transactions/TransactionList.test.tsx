import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './transactionSlice';
import TransactionList from './TransactionList';

const renderWithStore = (state: any) => {
  const store = configureStore({
    reducer: { transactions: transactionsReducer },
    preloadedState: { transactions: state }
  });

  return render(
    <Provider store={store}>
      <TransactionList />
    </Provider>
  );
};

describe('TransactionList', () => {
  it('renders empty state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data: [] }) }));
    renderWithStore({ loading: false, error: null, data: [] });

    expect(await screen.findByText('No transactions found.')).toBeInTheDocument();
  });


  it('renders data rows', async () => {
    const data = [
      { id: 1, account_id: 123, transaction_type_id: 1, datetime: '2026-04-03 00:00:00', amount: 100, description: 'Purchase test', note: 'note', fingerprint: 'fp1' }
    ];

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, data }) }));
    renderWithStore({ loading: false, error: null, data: [] });

    expect(await screen.findByText('Purchase test')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});
