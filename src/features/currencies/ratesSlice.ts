import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ExchangeRate } from '../../models/currencies';

export interface RatesState {
  loading: boolean;
  error: string | null;
  // keyed by "date:from:to"
  data: Record<string, ExchangeRate>;
}

const initialState: RatesState = {
  loading: false,
  error: null,
  data: {},
};

interface FetchRateArgs {
  date: string;
  from: string;
  to: string;
}

export const fetchRate = createAsyncThunk(
  'rates/fetchRate',
  async ({ date, from, to }: FetchRateArgs, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/currency/rates?date=${encodeURIComponent(date)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      );
      if (!response.ok) {
        const text = await response.text();
        return rejectWithValue(`HTTP ${response.status}: ${text}`);
      }
      const payload = (await response.json()) as {
        success: boolean;
        data?: ExchangeRate;
        error?: string;
      };
      if (!payload.success || !payload.data) {
        return rejectWithValue(payload.error || 'Unknown error');
      }
      return payload.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const ratesSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRate.fulfilled, (state, action) => {
        state.loading = false;
        const { date, from, to } = action.payload;
        const key = `${date}:${from}:${to}`;
        state.data[key] = action.payload;
      })
      .addCase(fetchRate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default ratesSlice.reducer;

export const rateKey = (date: string, from: string, to: string): string => `${date}:${from}:${to}`;
