import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import type { AppDispatch } from '../../store';
import importReducer, {
  importTransactions,
  resetImport,
  IMPORTER_TYPES,
  type ImportState,
} from './importSlice';
import authReducer from '../auth/authSlice';

function buildStore(preloadedAuth?: { token: string | null }) {
  const store = configureStore({
    reducer: {
      import: importReducer,
      auth: authReducer,
    },
    preloadedState: preloadedAuth
      ? {
          auth: {
            token: preloadedAuth.token,
            user: null,
            status: 'idle' as const,
          },
        }
      : undefined,
  });
  return store as Omit<typeof store, 'dispatch'> & { dispatch: AppDispatch };
}

describe('importSlice initial state', () => {
  it('has correct initial state', () => {
    const store = buildStore();
    const state: ImportState = store.getState().import;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.importId).toBe(null);
    expect(state.queuedCount).toBe(null);
  });
});

describe('resetImport action', () => {
  it('clears all state fields', () => {
    const store = buildStore();

    // Manually prime the state with fulfilled data by dispatching a success
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          import_id: 'abc',
          importer: 'rbc',
          queued_count: 5,
          message: 'ok',
        }),
      })
    );

    store.dispatch(resetImport());
    const state: ImportState = store.getState().import;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.importId).toBe(null);
    expect(state.queuedCount).toBe(null);
  });
});

describe('importTransactions thunk', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sets loading=true when pending', async () => {
    let resolveResponse!: (v: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolveResponse = resolve;
    });
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pendingPromise));

    const store = buildStore({ token: 'test-token' });
    const file = new File(['col1,col2\n1,2'], 'test.csv', { type: 'text/csv' });

    const thunkPromise = store.dispatch(importTransactions({ importerType: 'rbc', file }));

    // While pending
    expect(store.getState().import.loading).toBe(true);
    expect(store.getState().import.error).toBe(null);

    // Resolve the fetch to avoid dangling async
    resolveResponse({
      ok: true,
      json: async () => ({ import_id: 'x', importer: 'rbc', queued_count: 0, message: '' }),
    });
    await thunkPromise;
  });

  it('populates importId and queuedCount on success', async () => {
    const mockResponse = {
      import_id: 'import-uuid-123',
      importer: 'pcfinancial',
      queued_count: 12,
      message: 'Queued 12 transactions.',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
    );

    const store = buildStore({ token: 'bearer-token' });
    const file = new File(['date,amount\n2024-01-01,100'], 'import.csv', { type: 'text/csv' });

    await store.dispatch(importTransactions({ importerType: 'pcfinancial', file }));

    const state = store.getState().import;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
    expect(state.importId).toBe('import-uuid-123');
    expect(state.queuedCount).toBe(12);
  });

  it('sends Authorization header when token is present', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        import_id: 'id',
        importer: 'mbna',
        queued_count: 3,
        message: '',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const store = buildStore({ token: 'my-jwt-token' });
    const file = new File(['a,b\n1,2'], 'f.csv', { type: 'text/csv' });

    await store.dispatch(importTransactions({ importerType: 'mbna', file }));

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/import/api/v1/import/mbna');
    expect((options.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer my-jwt-token'
    );
  });

  it('does not send Authorization header when token is null', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        import_id: 'id',
        importer: 'nu',
        queued_count: 0,
        message: '',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const store = buildStore({ token: null });
    const file = new File(['a,b\n1,2'], 'f.csv', { type: 'text/csv' });

    await store.dispatch(importTransactions({ importerType: 'nu', file }));

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('uses the correct URL with importer type', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        import_id: 'id',
        importer: 'cibic-checking',
        queued_count: 0,
        message: '',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const store = buildStore({ token: 'tok' });
    const file = new File([''], 'x.csv');

    await store.dispatch(importTransactions({ importerType: 'cibic-checking', file }));

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/import/api/v1/import/cibic-checking');
  });

  it('sets error state on HTTP error response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => 'Unprocessable Entity',
      })
    );

    const store = buildStore({ token: 'tok' });
    const file = new File(['bad'], 'bad.csv');

    await store.dispatch(importTransactions({ importerType: 'rbc', file }));

    const state = store.getState().import;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('HTTP 422: Unprocessable Entity');
    expect(state.importId).toBe(null);
  });

  it('sets error state on network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const store = buildStore({ token: 'tok' });
    const file = new File([''], 'x.csv');

    await store.dispatch(importTransactions({ importerType: 'bb', file }));

    const state = store.getState().import;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network failure');
  });

  it('sends the file as FormData', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        import_id: 'id',
        importer: 'rbc',
        queued_count: 1,
        message: '',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const store = buildStore({ token: 'tok' });
    const file = new File(['col\nval'], 'data.csv', { type: 'text/csv' });

    await store.dispatch(importTransactions({ importerType: 'rbc', file }));

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.body).toBeInstanceOf(FormData);
    const body = options.body as FormData;
    expect(body.get('file')).toBe(file);
  });
});

describe('IMPORTER_TYPES constant', () => {
  it('contains all expected importers', () => {
    expect(IMPORTER_TYPES).toContain('pcfinancial');
    expect(IMPORTER_TYPES).toContain('mbna');
    expect(IMPORTER_TYPES).toContain('rbc');
    expect(IMPORTER_TYPES).toContain('bb');
    expect(IMPORTER_TYPES).toContain('nu');
    expect(IMPORTER_TYPES).toContain('cibic-checking');
    expect(IMPORTER_TYPES).toContain('cibic-savings');
    expect(IMPORTER_TYPES).toContain('c6-checking');
    expect(IMPORTER_TYPES).toHaveLength(8);
  });
});
