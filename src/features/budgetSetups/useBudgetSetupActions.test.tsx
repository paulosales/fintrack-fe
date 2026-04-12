import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useBudgetSetupActions, { buildBudgetSetupFormDefaults } from './useBudgetSetupActions';
import budgetSetupsReducer from './budgetSetupSlice';
import accountsReducer from '../accounts/accountsSlice';
import type { BudgetSetupRecord } from './types';

const createTestStore = () =>
  configureStore({
    reducer: {
      budgetSetups: budgetSetupsReducer,
      accounts: accountsReducer,
    },
  });

const wrapper = (store: ReturnType<typeof createTestStore>) =>
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };

const sampleBudgetSetup: BudgetSetupRecord = {
  id: 1,
  accountId: 10,
  accountCode: 'CHK',
  accountName: 'Checking',
  date: '2026-04-16',
  isRepeatle: true,
  repeatFrequency: 'MONTHLY',
  endDate: '2026-12-31',
  description: 'Rent',
  amount: -1200,
  note: 'auto-pay',
};

const defaultOptions = {
  dataLength: 3,
  page: 1,
  setPage: vi.fn(),
  reloadBudgetSetups: vi.fn(),
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

describe('useBudgetSetupActions', () => {
  it('initializes with dialog closed and no editing budget setup', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.editingBudgetSetup).toBeNull();
    expect(result.current.formError).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handleCreateClick opens the dialog in create mode', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleCreateClick());
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.editingBudgetSetup).toBeNull();
  });

  it('handleEditClick opens the dialog with the budget setup', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleEditClick(sampleBudgetSetup));
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.editingBudgetSetup).toEqual(sampleBudgetSetup);
  });

  it('handleDialogClose closes the dialog', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleCreateClick());
    act(() => result.current.handleDialogClose());
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.editingBudgetSetup).toBeNull();
  });

  it('handleDeleteClick opens confirm dialog', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.handleDeleteClick(sampleBudgetSetup));
    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.confirmPayload?.id).toBe(1);
  });

  it('closeFeedback clears actionError and actionMessage', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useBudgetSetupActions(defaultOptions), {
      wrapper: wrapper(store),
    });
    act(() => result.current.closeFeedback());
    expect(result.current.actionError).toBeNull();
    expect(result.current.actionMessage).toBeNull();
  });
});

describe('buildBudgetSetupFormDefaults', () => {
  const accounts = [{ id: 1, code: 'CHK', name: 'Checking', accountTypeId: 1 }];

  it('returns defaults from a given budget setup', () => {
    const result = buildBudgetSetupFormDefaults(sampleBudgetSetup, accounts);
    expect(result.accountId).toBe('10');
    expect(result.description).toBe('Rent');
    expect(result.amount).toBe('-1200');
    expect(result.isRepeatle).toBe(true);
    expect(result.repeatFrequency).toBe('MONTHLY');
  });

  it('uses first account id when budgetSetup is null', () => {
    const result = buildBudgetSetupFormDefaults(null, accounts);
    expect(result.accountId).toBe('1');
    expect(result.amount).toBe('');
    expect(result.description).toBe('');
  });

  it('sets accountId to empty string when budgetSetup is null and no accounts', () => {
    const result = buildBudgetSetupFormDefaults(null, []);
    expect(result.accountId).toBe('');
  });
});
