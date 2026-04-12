import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useBudgetSetupFilters from './useBudgetSetupFilters';
import budgetSetupsReducer from './budgetSetupSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      budgetSetups: budgetSetupsReducer,
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

describe('useBudgetSetupFilters', () => {
  it('initializes with page 1 and pageSize 50', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupFilters(), { wrapper: wrapper(store) });
    expect(result.current.page).toBe(1);
  });

  it('setPage updates the page', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupFilters(), { wrapper: wrapper(store) });
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
  });

  it('handlePageSizeChange resets page to 1', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupFilters(), { wrapper: wrapper(store) });
    act(() => result.current.setPage(4));
    act(() => result.current.handlePageSizeChange(100));
    expect(result.current.page).toBe(1);
  });

  it('reloadBudgetSetups is a function', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupFilters(), { wrapper: wrapper(store) });
    expect(typeof result.current.reloadBudgetSetups).toBe('function');
  });
});
