import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from '../features/transactions/transactionSlice';
import accountsReducer from '../features/accounts/accountsSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    accounts: accountsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
