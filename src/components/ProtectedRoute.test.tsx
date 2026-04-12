import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import ProtectedRoute from './ProtectedRoute';
import type { AuthState } from '../features/auth/types';
import { startPkceLogin } from '../features/auth/pkce';

vi.mock('../features/auth/pkce', () => ({
  startPkceLogin: vi.fn(),
  ID_TOKEN_KEY: 'fintrack-id-token',
}));

const createStore = (auth: Partial<AuthState> = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        token: null,
        user: null,
        status: 'idle',
        ...auth,
      } as AuthState,
    },
  });

const renderWithAuth = (auth: Partial<AuthState> = {}) =>
  render(
    <Provider store={createStore(auth)}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ProtectedRoute', () => {
  it('triggers Keycloak login when unauthenticated', () => {
    renderWithAuth({ status: 'idle' });
    expect(startPkceLogin).toHaveBeenCalledOnce();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('triggers Keycloak login when status is loading', () => {
    renderWithAuth({ status: 'loading' });
    expect(startPkceLogin).toHaveBeenCalledOnce();
  });

  it('renders protected content when authenticated', () => {
    renderWithAuth({
      status: 'authenticated',
      token: 'tok',
      user: { id: '1', email: 'a@b.com', name: 'Alice', picture: null },
    });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(startPkceLogin).not.toHaveBeenCalled();
  });

  it('does not trigger Keycloak login when logging out', () => {
    renderWithAuth({ status: 'logging-out' });
    expect(startPkceLogin).not.toHaveBeenCalled();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
