import { describe, it, expect } from 'vitest';
import reducer, { fetchRate, rateKey } from './ratesSlice';

const sampleRate = { date: '2026-04-25', from: 'USD', to: 'EUR', rate: 0.91 };

describe('ratesSlice', () => {
  it('returns the initial state', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.data).toEqual({});
  });

  it('sets loading on fetchRate.pending', () => {
    const next = reducer(undefined, { type: fetchRate.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it('stores rate keyed by date:from:to on fetchRate.fulfilled', () => {
    const next = reducer(undefined, { type: fetchRate.fulfilled.type, payload: sampleRate });
    expect(next.loading).toBe(false);
    expect(next.data['2026-04-25:USD:EUR']).toEqual(sampleRate);
  });

  it('accumulates multiple rates without overwriting existing ones', () => {
    const second = { date: '2026-04-25', from: 'USD', to: 'GBP', rate: 0.79 };
    let state = reducer(undefined, { type: fetchRate.fulfilled.type, payload: sampleRate });
    state = reducer(state, { type: fetchRate.fulfilled.type, payload: second });
    expect(Object.keys(state.data)).toHaveLength(2);
    expect(state.data['2026-04-25:USD:EUR'].rate).toBe(0.91);
    expect(state.data['2026-04-25:USD:GBP'].rate).toBe(0.79);
  });

  it('handles fetchRate.rejected', () => {
    const next = reducer(undefined, {
      type: fetchRate.rejected.type,
      payload: 'Rate not found',
    });
    expect(next.loading).toBe(false);
    expect(next.error).toBe('Rate not found');
  });
});

describe('rateKey helper', () => {
  it('formats key as date:from:to', () => {
    expect(rateKey('2026-04-25', 'USD', 'EUR')).toBe('2026-04-25:USD:EUR');
  });

  it('matches the key used by the slice reducer', () => {
    const state = reducer(undefined, { type: fetchRate.fulfilled.type, payload: sampleRate });
    const key = rateKey(sampleRate.date, sampleRate.from, sampleRate.to);
    expect(state.data[key]).toEqual(sampleRate);
  });
});
