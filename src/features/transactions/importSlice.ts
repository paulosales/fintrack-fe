import { createSlice } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../../store/typedThunk';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

export interface ImportState {
  loading: boolean;
  error: string | null;
  importId: string | null;
  queuedCount: number | null;
}

const initialState: ImportState = {
  loading: false,
  error: null,
  importId: null,
  queuedCount: null,
};

export const IMPORTER_TYPES = [
  'pcfinancial',
  'mbna',
  'rbc',
  'bb',
  'nu',
  'cibic-checking',
  'cibic-savings',
  'c6-checking',
] as const;

export type ImporterType = (typeof IMPORTER_TYPES)[number];

interface ImportResponse {
  import_id: string;
  importer: string;
  queued_count: number;
  message: string;
}

export const importTransactions = createAppAsyncThunk(
  'import/importTransactions',
  async (
    { importerType, file }: { importerType: ImporterType; file: File },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authenticatedFetch(
        `/import/api/v1/import/${importerType}`,
        {
          method: 'POST',
          body: formData,
        },
        { dispatch, getState }
      );

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      return (await response.json()) as ImportResponse;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Import failed');
    }
  }
);

const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    resetImport(state) {
      state.loading = false;
      state.error = null;
      state.importId = null;
      state.queuedCount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.importId = null;
        state.queuedCount = null;
      })
      .addCase(importTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.importId = action.payload.import_id;
        state.queuedCount = action.payload.queued_count;
      })
      .addCase(importTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetImport } = importSlice.actions;
export default importSlice.reducer;
