import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from '../features/transactions/transactionSlice';
import importReducer from '../features/transactions/importSlice';
import accountsReducer from '../features/accounts/accountsSlice';
import accountTypesReducer from '../features/accounts/accountTypesSlice';
import transactionTypesReducer from '../features/transactionTypes/transactionTypesSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import transactionCategoryTotalsReducer from '../features/transactionCategoryTotals/transactionCategoryTotalsSlice';
import budgetsReducer from '../features/budgets/budgetSlice';
import budgetSetupsReducer from '../features/budgetSetups/budgetSetupSlice';
import authReducer from '../features/auth/authSlice';
import settingsReducer from '../features/settings/settingsSlice';
import currenciesReducer from '../features/currencies/currenciesSlice';
import ratesReducer from '../features/currencies/ratesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    import: importReducer,
    accounts: accountsReducer,
    accountTypes: accountTypesReducer,
    transactionTypes: transactionTypesReducer,
    categories: categoriesReducer,
    transactionCategoryTotals: transactionCategoryTotalsReducer,
    budgets: budgetsReducer,
    budgetSetups: budgetSetupsReducer,
    settings: settingsReducer,
    currencies: currenciesReducer,
    rates: ratesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
