import { describe, it, expect } from 'vitest';
import reducer, { fetchCurrencies } from './currenciesSlice';

describe('currenciesSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data).toEqual([]);
  });

  it('sets loading on fetchCurrencies.pending', () => {
    const next = reducer(undefined, { type: fetchCurrencies.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles fetchCurrencies.fulfilled', () => {
    const currencies = [{ id: 1, code: 'USD', name: 'United States Dollar' }];
    const next = reducer(undefined, { type: fetchCurrencies.fulfilled.type, payload: currencies });
    expect(next.loading).toBe(false);
    expect(next.data).toEqual(currencies);
  });

  it('handles fetchCurrencies.rejected', () => {
    const next = reducer(undefined, {
      type: fetchCurrencies.rejected.type,
      payload: 'API unavailable',
    });
    expect(next.loading).toBe(false);
    expect(next.error).toBe('API unavailable');
  });
});
