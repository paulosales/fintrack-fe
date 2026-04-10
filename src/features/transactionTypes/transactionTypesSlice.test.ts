import { describe, it, expect } from 'vitest';
import reducer, { clearTransactionTypes, fetchTransactionTypes } from './transactionTypesSlice';

describe('transactionTypesSlice reducers', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(Array.isArray(state.data)).toBe(true);
  });

  it('clearTransactionTypes resets state', () => {
    const populated = {
      loading: true,
      error: 'err',
      data: [{ id: 1, name: 'A' }],
    } as any;
    const next = reducer(populated, clearTransactionTypes());
    expect(next.loading).toBe(false);
    expect(next.error).toBeNull();
    expect(next.data).toEqual([]);
  });

  it('sets loading on fetchTransactionTypes.pending', () => {
    const next = reducer(undefined, { type: fetchTransactionTypes.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles fetchTransactionTypes.fulfilled', () => {
    const payload = [{ id: 1, name: 'Credit' }];
    const next = reducer(undefined, { type: fetchTransactionTypes.fulfilled.type, payload });
    expect(next.loading).toBe(false);
    expect(next.data).toEqual(payload);
  });

  it('handles fetchTransactionTypes.rejected', () => {
    const action = { type: fetchTransactionTypes.rejected.type, payload: 'Network error' };
    const next = reducer(undefined, action as any);
    expect(next.loading).toBe(false);
    expect(next.error).toBe('Network error');
  });
});
