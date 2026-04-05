import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from '../features/transactions/transactionSlice';
import accountsReducer from '../features/accounts/accountsSlice';
import transactionTypesReducer from '../features/transactionTypes/transactionTypesSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import transactionCategoryTotalsReducer from '../features/transactionCategoryTotals/transactionCategoryTotalsSlice';
import budgetsReducer from '../features/budgets/budgetSlice';
import budgetSetupsReducer from '../features/budgetSetups/budgetSetupSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    accounts: accountsReducer,
    transactionTypes: transactionTypesReducer,
    categories: categoriesReducer,
    transactionCategoryTotals: transactionCategoryTotalsReducer,
    budgets: budgetsReducer,
    budgetSetups: budgetSetupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
