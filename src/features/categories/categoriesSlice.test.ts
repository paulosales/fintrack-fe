import { describe, it, expect } from 'vitest';
import reducer, { clearCategories, fetchCategories } from './categoriesSlice';

describe('categoriesSlice reducers', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(Array.isArray(state.data)).toBe(true);
  });

  it('clearCategories resets state', () => {
    const populated = {
      loading: true,
      error: 'err',
      data: [{ id: 1, name: 'A', code: 'A' }],
    } as any;
    const next = reducer(populated, clearCategories());
    expect(next.loading).toBe(false);
    expect(next.error).toBeNull();
    expect(next.data).toEqual([]);
  });

  it('sets loading on fetchCategories.pending', () => {
    const next = reducer(undefined, { type: fetchCategories.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('handles fetchCategories.fulfilled', () => {
    const payload = [{ id: 1, name: 'Food', code: 'FOOD' }];
    const next = reducer(undefined, { type: fetchCategories.fulfilled.type, payload });
    expect(next.loading).toBe(false);
    expect(next.data).toEqual(payload);
  });

  it('handles fetchCategories.rejected', () => {
    const action = { type: fetchCategories.rejected.type, payload: 'Network error' };
    const next = reducer(undefined, action as any);
    expect(next.loading).toBe(false);
    expect(next.error).toBe('Network error');
  });
});
