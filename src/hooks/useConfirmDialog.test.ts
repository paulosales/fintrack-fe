import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useConfirmDialog from './useConfirmDialog';

describe('useConfirmDialog', () => {
  it('initializes with open=false and null payload', () => {
    const { result } = renderHook(() => useConfirmDialog<string>());
    expect(result.current.open).toBe(false);
    expect(result.current.payload).toBeNull();
  });

  it('openConfirm sets open to true and stores the payload', () => {
    const { result } = renderHook(() => useConfirmDialog<string>());
    act(() => result.current.openConfirm('my-payload'));
    expect(result.current.open).toBe(true);
    expect(result.current.payload).toBe('my-payload');
  });

  it('closeConfirm resets open and payload', () => {
    const { result } = renderHook(() => useConfirmDialog<string>());
    act(() => result.current.openConfirm('my-payload'));
    act(() => result.current.closeConfirm());
    expect(result.current.open).toBe(false);
    expect(result.current.payload).toBeNull();
  });

  it('works with object payloads', () => {
    const { result } = renderHook(() => useConfirmDialog<{ id: number; label: string }>());
    act(() => result.current.openConfirm({ id: 42, label: 'Delete me' }));
    expect(result.current.payload).toEqual({ id: 42, label: 'Delete me' });
  });
});
