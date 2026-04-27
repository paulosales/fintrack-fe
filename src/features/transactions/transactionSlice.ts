import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../../store/typedThunk';
import type {
  Transaction,
  TransactionFilters,
  TransactionMutationPayload,
  TransactionState,
} from './types';
import type { SubTransaction, TransactionDetailsState } from './types';
import { defaultPagination } from '../../types/pagination';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

const initialState: TransactionState = {
  loading: false,
  error: null,
  detailsByTransactionId: {},
  data: [],
  pagination: defaultPagination,
};

const initialDetailsState = (): TransactionDetailsState => ({
  loading: false,
  error: null,
  data: [],
});

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

export const fetchTransactions = createAppAsyncThunk(
  'transactions/fetchTransactions',
  async (filters: TransactionFilters, { rejectWithValue, dispatch, getState }) => {
    try {
      const searchParams = new URLSearchParams();
      const description = filters.description.trim();

      if (filters.accountId !== null) {
        searchParams.set('account_id', String(filters.accountId));
      }

      if (filters.transactionTypeId !== null) {
        searchParams.set('transaction_type_id', String(filters.transactionTypeId));
      }

      if (filters.categoryId !== null) {
        searchParams.set('category_id', String(filters.categoryId));
      }

      if (description !== '') {
        searchParams.set('description', description);
      }

      searchParams.set('page', String(filters.page));
      searchParams.set('page_size', String(filters.pageSize));

      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const response = await authenticatedFetch(
        `/account/transactions${query}`,
        {},
        { dispatch, getState }
      );
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

export const fetchSubTransactions = createAppAsyncThunk(
  'transactions/fetchSubTransactions',
  async (transactionId: number, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        `/account/transactions/${transactionId}/sub_transactions`,
        {},
        { dispatch, getState }
      );

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: SubTransaction[];
        error?: string;
      };

      if (!payload.success) {
        return rejectWithValue(payload.error || 'Unknown error');
      }

      return { transactionId, data: payload.data || [] };
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateSubTransaction = createAppAsyncThunk(
  'transactions/updateSubTransaction',
  async (
    {
      id,
      transactionId,
      payload,
    }: {
      id: number;
      transactionId: number;
      payload: {
        productCode?: string | null;
        amount: number;
        description: string;
        note?: string | null;
        categoryIds?: number[];
      };
    },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/transactions/${transactionId}/sub_transactions/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const json = await response.json();
      if (!json.success) return rejectWithValue(json.error || 'Unknown error');

      return {
        transactionId: json.data.transactionId,
        data: json.data,
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'API call failed');
    }
  }
);

export const deleteSubTransaction = createAppAsyncThunk(
  'transactions/deleteSubTransaction',
  async (
    { id, transactionId }: { id: number; transactionId: number },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/transactions/${transactionId}/sub_transactions/${id}`,
        { method: 'DELETE' },
        { dispatch, getState }
      );
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const json = await response.json();
      if (!json.success) return rejectWithValue(json.error || 'Unknown error');
      return { id, transactionId };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'API call failed');
    }
  }
);

export const createSubTransaction = createAppAsyncThunk(
  'transactions/createSubTransaction',
  async (
    {
      transactionId,
      payload,
    }: {
      transactionId: number;
      payload: {
        productCode?: string | null;
        amount: number;
        description: string;
        note?: string | null;
        categoryIds?: number[];
      };
    },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/transactions/${transactionId}/sub_transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const json = await response.json();
      if (!json.success) return rejectWithValue(json.error || 'Unknown error');

      return {
        transactionId,
        data: json.data,
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'API call failed');
    }
  }
);

export const createTransaction = createAppAsyncThunk(
  'transactions/createTransaction',
  async (payload: TransactionMutationPayload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        '/account/transactions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      return await parseTransactionResponse(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTransaction = createAppAsyncThunk(
  'transactions/updateTransaction',
  async (
    { id, payload }: { id: number; payload: TransactionMutationPayload },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/transactions/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      return await parseTransactionResponse(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteTransaction = createAppAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        `/account/transactions/${id}`,
        {
          method: 'DELETE',
        },
        { dispatch, getState }
      );

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
    builder
      .addCase(fetchSubTransactions.pending, (state, action) => {
        const id = action.meta.arg;
        state.detailsByTransactionId = state.detailsByTransactionId || {};
        state.detailsByTransactionId[id] = {
          ...(state.detailsByTransactionId[id] || initialDetailsState()),
          loading: true,
          error: null,
        } as TransactionDetailsState;
      })
      .addCase(
        fetchSubTransactions.fulfilled,
        (state, action: PayloadAction<{ transactionId: number; data: SubTransaction[] }>) => {
          const id = action.payload.transactionId;
          state.detailsByTransactionId = state.detailsByTransactionId || {};
          state.detailsByTransactionId[id] = {
            loading: false,
            error: null,
            data: action.payload.data,
          } as TransactionDetailsState;
        }
      )
      .addCase(
        updateSubTransaction.fulfilled,
        (state, action: PayloadAction<{ transactionId: number; data: SubTransaction }>) => {
          const id = action.payload.transactionId;
          state.detailsByTransactionId = state.detailsByTransactionId || {};
          const existing = state.detailsByTransactionId[id] || { data: [] };
          const dataArr = existing.data || [];
          const idx = dataArr.findIndex((s) => s.id === action.payload.data.id);
          if (idx >= 0) {
            dataArr[idx] = action.payload.data;
          } else {
            dataArr.push(action.payload.data);
          }
          state.detailsByTransactionId[id] = {
            loading: false,
            error: null,
            data: dataArr,
          };
        }
      )
      .addCase(
        createSubTransaction.fulfilled,
        (state, action: PayloadAction<{ transactionId: number; data: SubTransaction }>) => {
          const id = action.payload.transactionId;
          state.detailsByTransactionId = state.detailsByTransactionId || {};
          const existing = state.detailsByTransactionId[id] || { data: [] };
          const dataArr = existing.data || [];
          dataArr.push(action.payload.data);
          state.detailsByTransactionId[id] = {
            loading: false,
            error: null,
            data: dataArr,
          };
        }
      )
      .addCase(
        deleteSubTransaction.fulfilled,
        (state, action: PayloadAction<{ id: number; transactionId: number }>) => {
          const { id: deletedId, transactionId } = action.payload;
          const key = transactionId;
          state.detailsByTransactionId = state.detailsByTransactionId || {};
          const detail = state.detailsByTransactionId[key];
          if (detail && Array.isArray(detail.data)) {
            state.detailsByTransactionId[key] = {
              ...detail,
              data: detail.data.filter((s) => s.id !== deletedId),
            };
          }
        }
      )
      .addCase(fetchSubTransactions.rejected, (state, action) => {
        const transactionId = action.meta.arg as number;
        const id = transactionId;
        state.detailsByTransactionId = state.detailsByTransactionId || {};
        state.detailsByTransactionId[id] = {
          ...(state.detailsByTransactionId[id] || initialDetailsState()),
          loading: false,
          error: (action.payload as string) || 'API call failed',
        } as TransactionDetailsState;
      });
  },
});

export const { clearTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;
