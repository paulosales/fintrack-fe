import { describe, it, expect, vi } from 'vitest';
import { formatDateTime } from './dateUtils';

describe('formatDateTime', () => {
  it('formats a valid datetime string', () => {
    expect(formatDateTime('2026-04-03 00:00:00')).toBe('2026-04-03 00:00:00');
  });

  it('formats a datetime with time components', () => {
    expect(formatDateTime('2024-01-15 10:30:45')).toBe('2024-01-15 10:30:45');
  });

  it('returns the original string for an invalid date', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(formatDateTime('not-a-date')).toBe('not-a-date');
    spy.mockRestore();
  });
});
