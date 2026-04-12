import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useCategoryActions, { buildCategoryFormDefaults } from './useCategoryActions';
import categoriesReducer from './categoriesSlice';
import type { Category } from '../../models/categories';

const createTestStore = () =>
  configureStore({
    reducer: {
      categories: categoriesReducer,
    },
  });

const wrapper = (store: ReturnType<typeof createTestStore>) =>
  function TestWrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };

const sampleCategory: Category = { id: 3, name: 'Groceries' };

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    })
  );
});

describe('useCategoryActions', () => {
  it('initializes with dialog closed and no editing category', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.editingCategory).toBeNull();
    expect(result.current.formError).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.actionError).toBeNull();
    expect(result.current.actionMessage).toBeNull();
  });

  it('handleCreateClick opens dialog in create mode', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleCreateClick());
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.editingCategory).toBeNull();
  });

  it('handleEditClick opens dialog with the category', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleEditClick(sampleCategory));
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.editingCategory).toEqual(sampleCategory);
  });

  it('handleDialogClose closes the dialog and clears editing', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleEditClick(sampleCategory));
    act(() => result.current.handleDialogClose());
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.editingCategory).toBeNull();
  });

  it('handleDeleteClick opens confirm dialog', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleDeleteClick(sampleCategory));
    expect(result.current.confirmOpen).toBe(true);
    expect(result.current.confirmPayload).toEqual(sampleCategory);
  });

  it('closeFeedback clears actionError and actionMessage', () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    act(() => result.current.closeFeedback());
    expect(result.current.actionError).toBeNull();
    expect(result.current.actionMessage).toBeNull();
  });

  it('handleSubmit sets formError when name is empty', async () => {
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    await act(async () => result.current.handleSubmit({ name: '   ' }));
    expect(result.current.formError).toBeTruthy();
    expect(result.current.dialogOpen).toBe(false);
  });

  it('handleSubmit dispatches createCategory and sets actionMessage on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { id: 10, name: 'Utilities' } }),
      })
    );
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    await act(async () => result.current.handleSubmit({ name: 'Utilities' }));
    expect(result.current.actionMessage).toBeTruthy();
    expect(result.current.dialogOpen).toBe(false);
  });

  it('handleSubmit dispatches updateCategory when editing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { id: 3, name: 'Updated' } }),
      })
    );
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleEditClick(sampleCategory));
    await act(async () => result.current.handleSubmit({ name: 'Updated' }));
    expect(result.current.actionMessage).toBeTruthy();
    expect(result.current.dialogOpen).toBe(false);
  });

  it('handleConfirm dispatches deleteCategory and sets actionMessage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })
    );
    const store = createTestStore();
    const { result } = renderHook(() => useCategoryActions(), { wrapper: wrapper(store) });
    act(() => result.current.handleDeleteClick(sampleCategory));
    await act(async () => result.current.handleConfirm());
    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.actionMessage).toBeTruthy();
  });
});

describe('buildCategoryFormDefaults', () => {
  it('returns name from given category', () => {
    expect(buildCategoryFormDefaults(sampleCategory)).toEqual({ name: 'Groceries' });
  });

  it('returns empty name when category is null', () => {
    expect(buildCategoryFormDefaults(null)).toEqual({ name: '' });
  });
});
