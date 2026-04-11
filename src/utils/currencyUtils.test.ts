import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currencyUtils';

describe('formatCurrency', () => {
  it('formats a whole number', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats a decimal amount', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats a negative amount', () => {
    expect(formatCurrency(-50.5)).toBe('-$50.50');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(9.999)).toBe('$10.00');
  });
});
