import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../../store/typedThunk';
import type { Category, CategoryMutationPayload } from '../../models/categories';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

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

const sortCategories = (categories: Category[]) =>
  [...categories].sort((left, right) => left.name.localeCompare(right.name));

const parseCategoryResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data?: Category;
    error?: string;
  };

  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Unknown error');
  }

  return payload.data;
};

export const fetchCategories = createAppAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch('/account/categories', {}, { dispatch, getState });
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

export const createCategory = createAppAsyncThunk(
  'categories/createCategory',
  async (payload: CategoryMutationPayload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        '/account/categories',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      return await parseCategoryResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateCategory = createAppAsyncThunk(
  'categories/updateCategory',
  async (
    { id, payload }: { id: number; payload: CategoryMutationPayload },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/categories/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );

      return await parseCategoryResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const deleteCategory = createAppAsyncThunk(
  'categories/deleteCategory',
  async (id: number, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        `/account/categories/${id}`,
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
      })
      .addCase(createCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.data = sortCategories([...state.data, action.payload]);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.data = sortCategories(
          state.data.map((category) =>
            category.id === action.payload.id ? action.payload : category
          )
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<number>) => {
        state.data = state.data.filter((category) => category.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
