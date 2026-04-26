import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Currency } from '../../models/currencies';

export interface CurrenciesState {
  loading: boolean;
  error: string | null;
  data: Currency[];
}

const initialState: CurrenciesState = {
  loading: false,
  error: null,
  data: [],
};

export const fetchCurrencies = createAsyncThunk(
  'currencies/fetchCurrencies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/currency/currencies');
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const payload = (await response.json()) as {
        success: boolean;
        data?: Currency[];
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

const currenciesSlice = createSlice({
  name: 'currencies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencies.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default currenciesSlice.reducer;
