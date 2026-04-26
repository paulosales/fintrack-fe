import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Setting, SettingMutationPayload } from '../../models/settings';
import type { RootState } from '../../store';

export interface SettingsState {
  loading: boolean;
  error: string | null;
  data: Setting[];
}

const initialState: SettingsState = {
  loading: false,
  error: null,
  data: [],
};

const parseSettingResponse = async (response: Response): Promise<Setting> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }
  const payload = (await response.json()) as {
    success: boolean;
    data?: Setting;
    error?: string;
  };
  if (!payload.success || !payload.data) {
    throw new Error(payload.error || 'Unknown error');
  }
  return payload.data;
};

const sortSettings = (settings: Setting[]) =>
  [...settings].sort((a, b) => a.code.localeCompare(b.code));

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/settings/settings');
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const payload = (await response.json()) as {
        success: boolean;
        data?: Setting[];
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

export const createSetting = createAsyncThunk(
  'settings/createSetting',
  async (payload: SettingMutationPayload, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await fetch('/settings/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      return await parseSettingResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const updateSetting = createAsyncThunk(
  'settings/updateSetting',
  async (
    { code, payload }: { code: string; payload: SettingMutationPayload },
    { rejectWithValue, getState }
  ) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await fetch(`/settings/settings/${encodeURIComponent(code)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      return await parseSettingResponse(response);
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

export const deleteSetting = createAsyncThunk(
  'settings/deleteSetting',
  async (code: string, { rejectWithValue, getState }) => {
    try {
      const token = (getState() as RootState).auth.token;
      const response = await fetch(`/settings/settings/${encodeURIComponent(code)}`, {
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
      return code;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'API call failed');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSetting.pending, (state) => {
        state.error = null;
      })
      .addCase(createSetting.fulfilled, (state, action: PayloadAction<Setting>) => {
        state.data = sortSettings([...state.data, action.payload]);
      })
      .addCase(createSetting.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateSetting.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSetting.fulfilled, (state, action: PayloadAction<Setting>) => {
        state.data = sortSettings(
          state.data.map((s) => (s.code === action.payload.code ? action.payload : s))
        );
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteSetting.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteSetting.fulfilled, (state, action: PayloadAction<string>) => {
        state.data = state.data.filter((s) => s.code !== action.payload);
      })
      .addCase(deleteSetting.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;

export const getCurrentCurrency = (state: RootState): string =>
  state.settings.data.find((s) => s.code === 'current_currency')?.value ?? 'USD';
