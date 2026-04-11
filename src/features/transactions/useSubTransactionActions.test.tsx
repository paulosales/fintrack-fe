import { type ReactNode } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useSubTransactionActions from './useSubTransactionActions';
import transactionsReducer from './transactionSlice';
import accountsReducer from '../accounts/accountsSlice';
import transactionTypesReducer from '../transactionTypes/transactionTypesSlice';
import categoriesReducer from '../categories/categoriesSlice';
import type { SubTransaction } from './types';

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
  function TestWrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };

const sampleSub: SubTransaction = {
  id: 5,
  transactionId: 100,
  productCode: 'P-1',
  description: 'Cheese',
  amount: 3.5,
  note: null,
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

describe('useSubTransactionActions', () => {
  it('initializes with empty expandedIds and no editingSub', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSubTransactionActions(), { wrapper: wrapper(store) });
    expect(result.current.expandedIds).toEqual([]);
    expect(result.current.editingSub).toBeNull();
    expect(result.current.creatingSubFor).toBeNull();
    expect(result.current.subDialogOpen).toBe(false);
  });

  it('toggleExpand adds a transactionId to expandedIds', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSubTransactionActions(), { wrapper: wrapper(store) });
    act(() => result.current.toggleExpand(100));
    expect(result.current.expandedIds).toContain(100);
  });

  it('toggleExpand removes an already-expanded transactionId', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSubTransactionActions(), { wrapper: wrapper(store) });
    act(() => result.current.toggleExpand(100));
    act(() => result.current.toggleExpand(100));
    expect(result.current.expandedIds).not.toContain(100);
  });

  it('handleEditSub sets editingSub and opens dialog', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSubTransactionActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleEditSub(sampleSub));
    expect(result.current.editingSub).toEqual(sampleSub);
    expect(result.current.subDialogOpen).toBe(true);
  });

  it('handleOpenCreateSub sets creatingSubFor and opens dialog', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSubTransactionActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleOpenCreateSub(100));
    expect(result.current.creatingSubFor).toBe(100);
    expect(result.current.subDialogOpen).toBe(true);
  });

  it('handleCloseSubDialog clears editing and creating state', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useSubTransactionActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleEditSub(sampleSub));
    act(() => result.current.handleCloseSubDialog());
    expect(result.current.editingSub).toBeNull();
    expect(result.current.creatingSubFor).toBeNull();
    expect(result.current.subDialogOpen).toBe(false);
  });
});
