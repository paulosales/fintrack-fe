import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Transaction,
  TransactionFilters,
  TransactionMutationPayload,
  TransactionState,
} from './types';
import { defaultPagination } from '../../types/pagination';

const initialState: TransactionState = {
  loading: false,
  error: null,
  data: [],
  pagination: defaultPagination,
};

interface TransactionsPayload {
  data: Transaction[];
  pagination: TransactionState['pagination'];
}

const parseTransactionResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: Transaction;
    error?: string;
  };

  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Unknown error');
  }

  return payload.data;
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

      if (filters.categoryId !== null) {
        searchParams.set('category_id', String(filters.categoryId));
      }

      searchParams.set('page', String(filters.page));
      searchParams.set('page_size', String(filters.pageSize));

      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const response = await fetch(`/api/transactions${query}`);
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const payload = (await response.json()) as {
        success: boolean;
        data?: Transaction[];
        pagination?: TransactionState['pagination'];
        error?: string;
      };
      if (!payload.success) {
        return rejectWithValue(payload.error || 'Unknown error');
      }
      return {
        data: payload.data || [],
        pagination: payload.pagination || defaultPagination,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (payload: TransactionMutationPayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await parseTransactionResponse(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async (
    { id, payload }: { id: number; payload: TransactionMutationPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await parseTransactionResponse(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!payload.success) {
        return rejectWithValue(payload.error || 'Unknown error');
      }

      return id;
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
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<TransactionsPayload>) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;
