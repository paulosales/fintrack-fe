import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import authReducer from './features/auth/authSlice';

vi.mock('./features/auth/pkce', () => ({
  startPkceLogin: vi.fn(),
}));
import transactionsReducer from './features/transactions/transactionSlice';
import importReducer from './features/transactions/importSlice';
import accountsReducer from './features/accounts/accountsSlice';
import transactionTypesReducer from './features/transactionTypes/transactionTypesSlice';
import categoriesReducer from './features/categories/categoriesSlice';
import transactionCategoryTotalsReducer from './features/transactionCategoryTotals/transactionCategoryTotalsSlice';
import budgetsReducer from './features/budgets/budgetSlice';
import budgetSetupsReducer from './features/budgetSetups/budgetSetupSlice';
import type { AuthState } from './features/auth/types';

const authenticatedAuth: AuthState = {
  token: 'test-token',
  user: { id: '1', email: 'test@example.com', name: 'Test User', picture: null },
  status: 'authenticated',
};

const createTestStore = (auth: AuthState = authenticatedAuth) =>
  configureStore({
    reducer: {
      auth: authReducer,
      transactions: transactionsReducer,
      import: importReducer,
      accounts: accountsReducer,
      transactionTypes: transactionTypesReducer,
      categories: categoriesReducer,
      transactionCategoryTotals: transactionCategoryTotalsReducer,
      budgets: budgetsReducer,
      budgetSetups: budgetSetupsReducer,
    },
    preloadedState: { auth },
  });

const renderApp = (initialPath = '/transactions', auth: AuthState = authenticatedAuth) => {
  const store = createTestStore(auth);
  return render(
    <ThemeProvider>
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </Provider>
    </ThemeProvider>
  );
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        pagination: { page: 1, pageSize: 50, totalCount: 0, totalPages: 0 },
      }),
    })
  );
});

import { startPkceLogin } from './features/auth/pkce';

describe('App — unauthenticated', () => {
  it('redirects to Keycloak and renders no protected content when not authenticated', () => {
    renderApp('/transactions', { token: null, user: null, status: 'idle' });
    expect(startPkceLogin).toHaveBeenCalledOnce();
    expect(screen.queryByRole('heading', { name: /Transaction List/i })).not.toBeInTheDocument();
  });
});

describe('App', () => {
  it('renders the app title', () => {
    renderApp();
    expect(screen.getByText('Fintrack')).toBeInTheDocument();
  });

  it('renders all navigation tabs', () => {
    renderApp();
    expect(screen.getByRole('tab', { name: /Transaction List/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Transactions By Category/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Categories/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Budget Setup/i })).toBeInTheDocument();
    const budgetTabs = screen.getAllByRole('tab', { name: /Budget/i });
    expect(budgetTabs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the TransactionList page at /transactions', () => {
    renderApp('/transactions');
    expect(screen.getByRole('heading', { name: /Transaction List/i })).toBeInTheDocument();
  });

  it('renders the CategoriesPage at /categories', () => {
    renderApp('/categories');
    expect(screen.getByRole('heading', { name: /Categories/i })).toBeInTheDocument();
  });

  it('redirects root path to /transactions', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { name: /Transaction List/i })).toBeInTheDocument();
  });

  it('redirects unknown paths to /transactions', () => {
    renderApp('/unknown-route');
    expect(screen.getByRole('heading', { name: /Transaction List/i })).toBeInTheDocument();
  });
});
