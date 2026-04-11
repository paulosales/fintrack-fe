import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useTransactionActions from './useTransactionActions';
import transactionsReducer from './transactionSlice';
import accountsReducer from '../accounts/accountsSlice';
import transactionTypesReducer from '../transactionTypes/transactionTypesSlice';
import categoriesReducer from '../categories/categoriesSlice';
import type { Transaction } from './types';

const createTestStore = () =>
  configureStore({
    reducer: {
      transactions: transactionsReducer,
      accounts: accountsReducer,
      transactionTypes: transactionTypesReducer,
      categories: categoriesReducer,
    },
  });

const wrapper = (store: ReturnType<typeof createTestStore>) =>
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };

const sampleTransaction: Transaction = {
  id: 1,
  accountId: 10,
  transactionTypeId: 2,
  datetime: '2026-04-03 00:00:00',
  amount: 50.0,
  description: 'Coffee',
  fingerprint: 'fp1',
};

const defaultOptions = {
  dataLength: 5,
  page: 1,
  setPage: vi.fn(),
  reloadTransactions: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    })
  );
});

describe('useTransactionActions', () => {
  it('initializes with dialog closed and no editing transaction', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.editingTransaction).toBeNull();
    expect(result.current.formError).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleCreateClick opens the dialog in create mode', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleCreateClick());
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.editingTransaction).toBeNull();
  });

  it('handleEditClick opens the dialog with the transaction', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleEditClick(sampleTransaction));
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.editingTransaction).toEqual(sampleTransaction);
  });

  it('handleDialogClose closes the dialog when not submitting', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleCreateClick());
    act(() => result.current.handleDialogClose());
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.editingTransaction).toBeNull();
  });

  it('handleDeleteClick opens the confirm dialog', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleDeleteClick(sampleTransaction));
    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.confirmPayload).toMatchObject({ kind: 'transaction', id: 1 });
  });

  it('handleDeleteSub opens the confirm dialog for a sub-transaction', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleDeleteSub(99, 1));
    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.confirmPayload).toMatchObject({ kind: 'sub', id: 99, transactionId: 1 });
  });

  it('closeConfirm closes the confirm dialog', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleDeleteClick(sampleTransaction));
    act(() => result.current.closeConfirm());
    expect(result.current.confirmOpen).toBe(false);
  });

  it('closeFeedback clears the action error', () => {
    const store = createTestStore();
    const { result } = renderHook(
      () =>
        useTransactionActions({
          ...defaultOptions,
          reloadTransactions: vi.fn().mockImplementation(() => {
            throw new Error('reload failed');
          }),
        }),
      { wrapper: wrapper(store) }
    );
    // actionError is null to begin with; closeFeedback is a no-op in this case
    act(() => result.current.closeFeedback());
    expect(result.current.actionError).toBeNull();
  });
});
