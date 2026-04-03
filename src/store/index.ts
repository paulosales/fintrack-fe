import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from '../features/transactions/transactionSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
