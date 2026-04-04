import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Transaction, TransactionFilters, TransactionState } from './types';

const initialState: TransactionState = {
  loading: false,
  error: null,
  data: [],
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (filters: TransactionFilters, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();

      if (filters.accountId !== null) {
        searchParams.set('account_id', String(filters.accountId));
      }

      if (filters.transactionTypeId !== null) {
        searchParams.set('transaction_type_id', String(filters.transactionTypeId));
      }

      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const response = await fetch(`/api/transactions${query}`);
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const payload = (await response.json()) as {
        success: boolean;
        data?: Transaction[];
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

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions(state) {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;
