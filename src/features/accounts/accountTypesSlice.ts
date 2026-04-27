import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../../store/typedThunk';
import type { AccountType, AccountTypeMutationPayload } from '../../models/accountTypes';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

export interface AccountTypesState {
  loading: boolean;
  error: string | null;
  data: AccountType[];
}

const initialState: AccountTypesState = {
  loading: false,
  error: null,
  data: [],
};

const sortAccountTypes = (accountTypes: AccountType[]) =>
  [...accountTypes].sort((a, b) => a.name.localeCompare(b.name));

const parseAccountTypeResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  const payload = (await response.json()) as {
    success: boolean;
    data?: AccountType;
    error?: string;
  };
  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Unknown error');
  }
  return payload.data;
};

export const fetchAccountTypes = createAppAsyncThunk(
  'accountTypes/fetchAccountTypes',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        '/account/account-types',
        {},
        { dispatch, getState }
      );
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const payload = (await response.json()) as {
        success: boolean;
        data?: AccountType[];
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

export const createAccountType = createAppAsyncThunk(
  'accountTypes/createAccountType',
  async (payload: AccountTypeMutationPayload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        '/account/account-types',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );
      return await parseAccountTypeResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateAccountType = createAppAsyncThunk(
  'accountTypes/updateAccountType',
  async (
    { id, payload }: { id: number; payload: AccountTypeMutationPayload },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/account-types/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );
      return await parseAccountTypeResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const deleteAccountType = createAppAsyncThunk(
  'accountTypes/deleteAccountType',
  async (id: number, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        `/account/account-types/${id}`,
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

const accountTypesSlice = createSlice({
  name: 'accountTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountTypes.fulfilled, (state, action: PayloadAction<AccountType[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAccountTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAccountType.pending, (state) => {
        state.error = null;
      })
      .addCase(createAccountType.fulfilled, (state, action: PayloadAction<AccountType>) => {
        state.data = sortAccountTypes([...state.data, action.payload]);
      })
      .addCase(createAccountType.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateAccountType.pending, (state) => {
        state.error = null;
      })
      .addCase(updateAccountType.fulfilled, (state, action: PayloadAction<AccountType>) => {
        state.data = sortAccountTypes(
          state.data.map((at) => (at.id === action.payload.id ? action.payload : at))
        );
      })
      .addCase(updateAccountType.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteAccountType.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteAccountType.fulfilled, (state, action: PayloadAction<number>) => {
        state.data = state.data.filter((at) => at.id !== action.payload);
      })
      .addCase(deleteAccountType.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default accountTypesSlice.reducer;
