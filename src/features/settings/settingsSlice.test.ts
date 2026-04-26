import { describe, it, expect } from 'vitest';
import reducer, { fetchSettings, getCurrentCurrency } from './settingsSlice';
import type { RootState } from '../../store';

describe('settingsSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data).toEqual([]);
  });

  it('sets loading on fetchSettings.pending', () => {
    const next = reducer(undefined, { type: fetchSettings.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles fetchSettings.fulfilled', () => {
    const settings = [{ id: 1, code: 'current_currency', description: 'Currency', value: 'CAD' }];
    const next = reducer(undefined, { type: fetchSettings.fulfilled.type, payload: settings });
    expect(next.loading).toBe(false);
    expect(next.data).toEqual(settings);
  });

  it('handles fetchSettings.rejected', () => {
    const next = reducer(undefined, {
      type: fetchSettings.rejected.type,
      payload: 'Network error',
    });
    expect(next.loading).toBe(false);
    expect(next.error).toBe('Network error');
  });
});

describe('getCurrentCurrency selector', () => {
  const makeState = (
    settingsData: { id: number; code: string; description: string; value: string | null }[]
  ): RootState =>
    ({ settings: { loading: false, error: null, data: settingsData } }) as unknown as RootState;

  it('returns the current_currency value when present', () => {
    const state = makeState([
      { id: 1, code: 'current_currency', description: 'Currency', value: 'EUR' },
    ]);
    expect(getCurrentCurrency(state)).toBe('EUR');
  });

  it('defaults to USD when current_currency is not found', () => {
    const state = makeState([]);
    expect(getCurrentCurrency(state)).toBe('USD');
  });

  it('defaults to USD when current_currency value is null', () => {
    const state = makeState([
      { id: 1, code: 'current_currency', description: 'Currency', value: null },
    ]);
    expect(getCurrentCurrency(state)).toBe('USD');
  });
});
