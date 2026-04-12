import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultPagination } from '../../types/pagination';
import type {
  TransactionCategoryTotal,
  TransactionCategoryTotalDetail,
  TransactionCategoryTotalDetailRequest,
  TransactionCategoryTotalDetailState,
  TransactionCategoryTotalsFilters,
  TransactionCategoryTotalsState,
} from './types';
import { getTransactionCategoryDetailKey } from './types';

const createEmptyDetailState = (): TransactionCategoryTotalDetailState => ({
  loading: false,
  error: null,
  data: [],
});

const initialState: TransactionCategoryTotalsState = {
  loading: false,
  error: null,
  data: [],
  detailsByKey: {},
  pagination: defaultPagination,
};

interface TransactionCategoryTotalsPayload {
  data: TransactionCategoryTotal[];
  pagination: TransactionCategoryTotalsState['pagination'];
}

export const fetchTransactionCategoryTotals = createAsyncThunk(
  'transactionCategoryTotals/fetchTotals',
  async (filters: TransactionCategoryTotalsFilters, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();

      if (filters.month !== null) {
        searchParams.set('month', String(filters.month));
      }

      if (filters.year !== null) {
        searchParams.set('year', String(filters.year));
      }

      if (filters.categoryId !== null) {
        searchParams.set('category_id', String(filters.categoryId));
      }

      searchParams.set('page', String(filters.page));
      searchParams.set('page_size', String(filters.pageSize));

      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const response = await fetch(`/account/transaction-category-totals${query}`);

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: TransactionCategoryTotal[];
        pagination?: TransactionCategoryTotalsState['pagination'];
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

export const fetchTransactionCategoryTotalDetails = createAsyncThunk(
  'transactionCategoryTotals/fetchDetails',
  async (request: TransactionCategoryTotalDetailRequest, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({
        month: String(request.month),
        year: String(request.year),
        category_id: String(request.categoryId),
      });

      const response = await fetch(
        `/account/transaction-category-totals/details?${searchParams.toString()}`
      );

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: TransactionCategoryTotalDetail[];
        error?: string;
      };

      if (!payload.success) {
        return rejectWithValue(payload.error || 'Unknown error');
      }

      return {
        request,
        data: payload.data || [],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue({
        request,
        error: errorMessage,
      });
    }
  },
  {
    condition: (request, { getState }) => {
      const state = getState() as {
        transactionCategoryTotals: TransactionCategoryTotalsState;
      };
      const key = getTransactionCategoryDetailKey(request);
      const existing = state.transactionCategoryTotals.detailsByKey[key];

      if (!existing) {
        return true;
      }

      return !existing.loading && existing.data.length === 0;
    },
  }
);

const transactionCategoryTotalsSlice = createSlice({
  name: 'transactionCategoryTotals',
  initialState,
  reducers: {
    clearTransactionCategoryTotals(state) {
      state.loading = false;
      state.error = null;
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionCategoryTotals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactionCategoryTotals.fulfilled,
        (state, action: PayloadAction<TransactionCategoryTotalsPayload>) => {
          state.loading = false;
          state.data = action.payload.data;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchTransactionCategoryTotals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactionCategoryTotalDetails.pending, (state, action) => {
        const key = getTransactionCategoryDetailKey(action.meta.arg);
        state.detailsByKey[key] = {
          ...(state.detailsByKey[key] || createEmptyDetailState()),
          loading: true,
          error: null,
        };
      })
      .addCase(fetchTransactionCategoryTotalDetails.fulfilled, (state, action) => {
        const key = getTransactionCategoryDetailKey(action.payload.request);
        state.detailsByKey[key] = {
          loading: false,
          error: null,
          data: action.payload.data,
        };
      })
      .addCase(fetchTransactionCategoryTotalDetails.rejected, (state, action) => {
        const payload = action.payload as
          | { request: TransactionCategoryTotalDetailRequest; error: string }
          | undefined;
        const request = payload?.request || action.meta.arg;
        const key = getTransactionCategoryDetailKey(request);
        state.detailsByKey[key] = {
          ...(state.detailsByKey[key] || createEmptyDetailState()),
          loading: false,
          error: payload?.error || (action.payload as string) || 'API call failed',
        };
      });
  },
});

export const { clearTransactionCategoryTotals } = transactionCategoryTotalsSlice.actions;
export default transactionCategoryTotalsSlice.reducer;
