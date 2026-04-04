import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '../../models/categories';

export interface CategoriesState {
  loading: boolean;
  error: string | null;
  data: Category[];
}

const initialState: CategoriesState = {
  loading: false,
  error: null,
  data: [],
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as {
        success: boolean;
        data?: Category[];
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

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories(state) {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
