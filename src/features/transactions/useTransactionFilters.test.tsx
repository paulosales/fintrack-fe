import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useTransactionFilters from './useTransactionFilters';
import transactionsReducer from './transactionSlice';
import accountsReducer from '../accounts/accountsSlice';
import transactionTypesReducer from '../transactionTypes/transactionTypesSlice';
import categoriesReducer from '../categories/categoriesSlice';

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

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [], meta: { page: 1, pageSize: 50, totalCount: 0, totalPages: 0 } }),
    })
  );
});

describe('useTransactionFilters', () => {
  it('initializes with default filter values', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionFilters(), { wrapper: wrapper(store) });
    expect(result.current.filters.accountId).toBeNull();
    expect(result.current.filters.transactionTypeId).toBeNull();
    expect(result.current.filters.categoryId).toBeNull();
    expect(result.current.filters.description).toBe('');
    expect(result.current.filters.page).toBe(1);
    expect(result.current.filters.pageSize).toBe(50);
  });

  it('handleAccountChange sets accountId and resets page', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionFilters(), { wrapper: wrapper(store) });
    act(() => result.current.setPage(3));
    act(() => result.current.handleAccountChange(5));
    expect(result.current.filters.accountId).toBe(5);
    expect(result.current.filters.page).toBe(1);
  });

  it('handleTransactionTypeChange sets transactionTypeId and resets page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionFilters(), { wrapper: wrapper(store) });
    act(() => result.current.handleTransactionTypeChange(3));
    expect(result.current.filters.transactionTypeId).toBe(3);
    expect(result.current.filters.page).toBe(1);
  });

  it('handleCategoryChange sets categoryId and resets page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionFilters(), { wrapper: wrapper(store) });
    act(() => result.current.handleCategoryChange(7));
    expect(result.current.filters.categoryId).toBe(7);
    expect(result.current.filters.page).toBe(1);
  });

  it('handlePageSizeChange updates pageSize and resets page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionFilters(), { wrapper: wrapper(store) });
    act(() => result.current.setPage(2));
    act(() => result.current.handlePageSizeChange(100));
    expect(result.current.filters.pageSize).toBe(100);
    expect(result.current.filters.page).toBe(1);
  });

  it('setPage updates the page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionFilters(), { wrapper: wrapper(store) });
    act(() => result.current.setPage(4));
    expect(result.current.filters.page).toBe(4);
  });
});
