import { describe, it, expect } from 'vitest';
import reducer, { clearAccounts, fetchAccounts } from './accountsSlice';

describe('accountsSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data).toEqual([]);
  });

  it('clearAccounts resets state to initial values', () => {
    const populated = {
      loading: true,
      error: 'some error',
      data: [{ id: 1, code: 'CHK', name: 'Checking', accountTypeId: 1 }],
    };
    const next = reducer(populated, clearAccounts());
    expect(next.loading).toBe(false);
    expect(next.error).toBeNull();
    expect(next.data).toEqual([]);
  });

  it('sets loading on fetchAccounts.pending', () => {
    const next = reducer(undefined, { type: fetchAccounts.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles fetchAccounts.fulfilled', () => {
    const accounts = [{ id: 1, code: 'CHK', name: 'Checking', accountTypeId: 1 }];
    const next = reducer(undefined, { type: fetchAccounts.fulfilled.type, payload: accounts });
    expect(next.loading).toBe(false);
    expect(next.data).toEqual(accounts);
  });

  it('handles fetchAccounts.rejected', () => {
    const next = reducer(undefined, {
      type: fetchAccounts.rejected.type,
      payload: 'Network error',
    });
    expect(next.loading).toBe(false);
    expect(next.error).toBe('Network error');
  });
});
