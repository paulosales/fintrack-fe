import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../../store/typedThunk';
import type { Account, AccountMutationPayload } from '../../models/accounts';
import { authenticatedFetch } from '../../utils/authenticatedFetch';

export interface AccountsState {
  loading: boolean;
  error: string | null;
  data: Account[];
}

const initialState: AccountsState = {
  loading: false,
  error: null,
  data: [],
};

const sortAccounts = (accounts: Account[]) =>
  [...accounts].sort((a, b) => a.code.localeCompare(b.code));

const parseAccountResponse = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  const payload = (await response.json()) as {
    success: boolean;
    data?: Account;
    error?: string;
  };
  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Unknown error');
  }
  return payload.data;
};

export const fetchAccounts = createAppAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch('/account/accounts', {}, { dispatch, getState });
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const payload = (await response.json()) as {
        success: boolean;
        data?: Account[];
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

export const createAccount = createAppAsyncThunk(
  'accounts/createAccount',
  async (payload: AccountMutationPayload, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        '/account/accounts',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );
      return await parseAccountResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateAccount = createAppAsyncThunk(
  'accounts/updateAccount',
  async (
    { id, payload }: { id: number; payload: AccountMutationPayload },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await authenticatedFetch(
        `/account/accounts/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        { dispatch, getState }
      );
      return await parseAccountResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const deleteAccount = createAppAsyncThunk(
  'accounts/deleteAccount',
  async (id: number, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await authenticatedFetch(
        `/account/accounts/${id}`,
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

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearAccounts(state) {
      state.data = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<Account[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAccount.pending, (state) => {
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.data = sortAccounts([...state.data, action.payload]);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateAccount.pending, (state) => {
        state.error = null;
      })
      .addCase(updateAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.data = sortAccounts(
          state.data.map((account) => (account.id === action.payload.id ? action.payload : account))
        );
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteAccount.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action: PayloadAction<number>) => {
        state.data = state.data.filter((account) => account.id !== action.payload);
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;
