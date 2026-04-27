import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './index';

/**
 * A pre-typed version of `createAsyncThunk` that binds `state` and `dispatch`
 * to the app's concrete `RootState` and `AppDispatch` types.  Use this instead
 * of the plain `createAsyncThunk` in feature slices so that `getState()` and
 * `dispatch` are fully typed without casting.
 */
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
}>();
