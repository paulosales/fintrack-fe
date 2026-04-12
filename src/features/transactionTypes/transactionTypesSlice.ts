import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TransactionType } from '../../models/transactionTypes';
import type { RootState } from '../../store';

export interface TransactionTypesState {
  loading: boolean;
  error: string | null;
  data: TransactionType[];
}

const initialState: TransactionTypesState = {
  loading: false,
  error: null,
  data: [],
};

export const fetchTransactionTypes = createAsyncThunk(
  'transactionTypes/fetchTransactionTypes',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await fetch('/account/transaction-types', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: TransactionType[];
        error?: string;
      };

      if (!payload.success) {
        return rejectWithValue(payload.error || 'Unknown error');
      }

      return payload.data || [];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const transactionTypesSlice = createSlice({
  name: 'transactionTypes',
  initialState,
  reducers: {
    clearTransactionTypes(state) {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactionTypes.fulfilled,
        (state, action: PayloadAction<TransactionType[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchTransactionTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionTypes } = transactionTypesSlice.actions;
export default transactionTypesSlice.reducer;
