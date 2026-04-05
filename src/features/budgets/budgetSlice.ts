import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultPagination } from '../../types/pagination';
import type {
  BudgetDetailRequest,
  BudgetDetailState,
  BudgetGeneratePayload,
  BudgetMonthFilters,
  BudgetMonthTotal,
  BudgetMutationPayload,
  BudgetRecord,
  BudgetState,
} from './types';
import { getBudgetDetailKey } from './types';

const createEmptyDetailState = (): BudgetDetailState => ({
  loading: false,
  error: null,
  data: [],
});

const initialState: BudgetState = {
  loading: false,
  error: null,
  data: [],
  detailsByKey: {},
  pagination: defaultPagination,
};

interface BudgetMonthTotalsPayload {
  data: BudgetMonthTotal[];
  pagination: BudgetState['pagination'];
}

const parseBudgetResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: BudgetRecord;
    error?: string;
  };

  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Unknown error');
  }

  return payload.data;
};

export const fetchBudgetMonthTotals = createAsyncThunk(
  'budgets/fetchMonthTotals',
  async (filters: BudgetMonthFilters, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({
        page: String(filters.page),
        page_size: String(filters.pageSize),
      });

      const response = await fetch(`/api/budgets?${searchParams.toString()}`);

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: BudgetMonthTotal[];
        pagination?: BudgetState['pagination'];
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
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const fetchBudgetDetails = createAsyncThunk(
  'budgets/fetchDetails',
  async (request: BudgetDetailRequest, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({
        year: String(request.year),
        month: String(request.month),
      });

      const response = await fetch(`/api/budgets/details?${searchParams.toString()}`);

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: BudgetRecord[];
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
      return rejectWithValue({
        request,
        error: error instanceof Error ? error.message : 'API call failed',
      });
    }
  },
  {
    condition: (request, { getState }) => {
      const state = getState() as { budgets: BudgetState };
      const key = getBudgetDetailKey(request);
      const existing = state.budgets.detailsByKey[key];

      if (!existing) {
        return true;
      }

      return !existing.loading && existing.data.length === 0;
    },
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (payload: BudgetMutationPayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await parseBudgetResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async (
    { id, payload }: { id: number; payload: BudgetMutationPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return await parseBudgetResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as { success: boolean; error?: string };

      if (!payload.success) {
        return rejectWithValue(payload.error || 'Unknown error');
      }

      return id;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const generateBudgets = createAsyncThunk(
  'budgets/generateBudgets',
  async (payload: BudgetGeneratePayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/budgets/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const result = (await response.json()) as {
        success: boolean;
        createdCount?: number;
        error?: string;
      };

      if (!result.success) {
        return rejectWithValue(result.error || 'Unknown error');
      }

      return result.createdCount || 0;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgetMonthTotals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBudgetMonthTotals.fulfilled,
        (state, action: PayloadAction<BudgetMonthTotalsPayload>) => {
          state.loading = false;
          state.data = action.payload.data;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchBudgetMonthTotals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBudgetDetails.pending, (state, action) => {
        const key = getBudgetDetailKey(action.meta.arg);
        state.detailsByKey[key] = {
          ...(state.detailsByKey[key] || createEmptyDetailState()),
          loading: true,
          error: null,
        };
      })
      .addCase(fetchBudgetDetails.fulfilled, (state, action) => {
        const key = getBudgetDetailKey(action.payload.request);
        state.detailsByKey[key] = {
          loading: false,
          error: null,
          data: action.payload.data,
        };
      })
      .addCase(fetchBudgetDetails.rejected, (state, action) => {
        const payload = action.payload as
          | { request: BudgetDetailRequest; error: string }
          | undefined;
        const request = payload?.request || action.meta.arg;
        const key = getBudgetDetailKey(request);

        state.detailsByKey[key] = {
          ...(state.detailsByKey[key] || createEmptyDetailState()),
          loading: false,
          error: payload?.error || (action.payload as string) || 'API call failed',
        };
      });
  },
});

export default budgetSlice.reducer;