import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultPagination } from '../../types/pagination';
import type { RootState } from '../../store';
import type {
  BudgetSetupFilters,
  BudgetSetupMutationPayload,
  BudgetSetupRecord,
  BudgetSetupState,
} from './types';

const initialState: BudgetSetupState = {
  loading: false,
  error: null,
  data: [],
  pagination: defaultPagination,
};

interface BudgetSetupListPayload {
  data: BudgetSetupRecord[];
  pagination: BudgetSetupState['pagination'];
}

const parseBudgetSetupResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: BudgetSetupRecord;
    error?: string;
  };

  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Unknown error');
  }

  return payload.data;
};

export const fetchBudgetSetups = createAsyncThunk(
  'budgetSetups/fetchBudgetSetups',
  async (filters: BudgetSetupFilters, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const searchParams = new URLSearchParams({
        page: String(filters.page),
        page_size: String(filters.pageSize),
      });

      const response = await fetch(`/account/budget-setups?${searchParams.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: BudgetSetupRecord[];
        pagination?: BudgetSetupState['pagination'];
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

export const createBudgetSetup = createAsyncThunk(
  'budgetSetups/createBudgetSetup',
  async (payload: BudgetSetupMutationPayload, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await fetch('/account/budget-setups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      return await parseBudgetSetupResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateBudgetSetup = createAsyncThunk(
  'budgetSetups/updateBudgetSetup',
  async (
    { id, payload }: { id: number; payload: BudgetSetupMutationPayload },
    { rejectWithValue, getState }
  ) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await fetch(`/account/budget-setups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      return await parseBudgetSetupResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const deleteBudgetSetup = createAsyncThunk(
  'budgetSetups/deleteBudgetSetup',
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await fetch(`/account/budget-setups/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

const budgetSetupSlice = createSlice({
  name: 'budgetSetups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgetSetups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBudgetSetups.fulfilled,
        (state, action: PayloadAction<BudgetSetupListPayload>) => {
          state.loading = false;
          state.data = action.payload.data;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchBudgetSetups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default budgetSetupSlice.reducer;
