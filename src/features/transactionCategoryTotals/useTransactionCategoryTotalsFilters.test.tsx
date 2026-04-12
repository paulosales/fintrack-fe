import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useTransactionCategoryTotalsFilters from './useTransactionCategoryTotalsFilters';
import transactionCategoryTotalsReducer from './transactionCategoryTotalsSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      transactionCategoryTotals: transactionCategoryTotalsReducer,
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
      json: async () => ({
        success: true,
        data: [],
        pagination: { page: 1, pageSize: 50, totalCount: 0, totalPages: 0 },
      }),
    })
  );
});

describe('useTransactionCategoryTotalsFilters', () => {
  it('initializes with default values', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    expect(result.current.month).toBeNull();
    expect(result.current.year).toBeNull();
    expect(result.current.categoryId).toBeNull();
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(50);
  });

  it('provides 13 monthOptions (all + 12 months)', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    expect(result.current.monthOptions).toHaveLength(13);
    expect(result.current.monthOptions[0].value).toBe('');
    expect(result.current.monthOptions[1].value).toBe(1);
    expect(result.current.monthOptions[12].value).toBe(12);
  });

  it('handleMonthChange sets month and resets page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.setPage(3));
    act(() => result.current.handleMonthChange('4'));
    expect(result.current.month).toBe(4);
    expect(result.current.page).toBe(1);
  });

  it('handleMonthChange sets null when value is empty string', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleMonthChange('4'));
    act(() => result.current.handleMonthChange(''));
    expect(result.current.month).toBeNull();
  });

  it('handleCategoryChange sets categoryId and resets page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.setPage(2));
    act(() => result.current.handleCategoryChange('7'));
    expect(result.current.categoryId).toBe(7);
    expect(result.current.page).toBe(1);
  });

  it('handleCategoryChange sets null when value is empty string', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleCategoryChange('5'));
    act(() => result.current.handleCategoryChange(''));
    expect(result.current.categoryId).toBeNull();
  });

  it('handlePageSizeChange updates pageSize and resets page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.setPage(3));
    act(() => result.current.handlePageSizeChange(100));
    expect(result.current.pageSize).toBe(100);
    expect(result.current.page).toBe(1);
  });

  it('setPage updates the page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.setPage(5));
    expect(result.current.page).toBe(5);
  });

  it('handleReload is a function', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useTransactionCategoryTotalsFilters(), {
      wrapper: wrapper(store),
    });
    expect(typeof result.current.handleReload).toBe('function');
  });
});
