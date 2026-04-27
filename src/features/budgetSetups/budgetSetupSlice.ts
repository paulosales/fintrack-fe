import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../../store/typedThunk';
import { defaultPagination } from '../../types/pagination';
import { authenticatedFetch } from '../../utils/authenticatedFetch';
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

export const fetchBudgetSetups = createAppAsyncThunk(
  'budgetSetups/fetchBudgetSetups',
  async (filters: BudgetSetupFilters, { rejectWithValue, dispatch, getState }) => {
    try {
      const searchParams = new URLSearchParams({
        page: String(filters.page),
        page_size: String(filters.pageSize),
      });

      const response = await authenticatedFetch(
        `/account/budget-setups?${searchParams.toString()}`,
        {},
        { dispatch, getState }
      );

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

export const createBudgetSetup = createAppAsyncThunk(
  'budgetSetups/createBudgetSetup',
  async (payload: BudgetSetupMutationPayload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        '/account/budget-setups',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      return await parseBudgetSetupResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateBudgetSetup = createAppAsyncThunk(
  'budgetSetups/updateBudgetSetup',
  async (
    { id, payload }: { id: number; payload: BudgetSetupMutationPayload },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/budget-setups/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      return await parseBudgetSetupResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const deleteBudgetSetup = createAppAsyncThunk(
  'budgetSetups/deleteBudgetSetup',
  async (id: number, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        `/account/budget-setups/${id}`,
        {
          method: 'DELETE',
        },
        { dispatch, getState }
      );

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
