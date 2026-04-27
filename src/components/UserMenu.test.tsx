import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import UserMenu from './UserMenu';
import type { AuthState } from '../features/auth/types';
import { startPkceLogout } from '../features/auth/pkce';

vi.mock('../features/auth/pkce', () => ({
  startPkceLogout: vi.fn(),
  ID_TOKEN_KEY: 'fintrack-id-token',
  REFRESH_TOKEN_KEY: 'fintrack-refresh-token',
  refreshAccessToken: vi.fn(),
}));

const createStore = (auth: Partial<AuthState> = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        token: 'tok',
        user: { id: '1', email: 'alice@example.com', name: 'Alice', picture: null },
        status: 'authenticated',
        ...auth,
      } as AuthState,
    },
  });

const renderUserMenu = (auth: Partial<AuthState> = {}) =>
  render(
    <Provider store={createStore(auth)}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<UserMenu />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

describe('UserMenu', () => {
  it('renders nothing when user is null', () => {
    const { container } = renderUserMenu({ user: null });
    expect(container.firstChild).toBeNull();
  });

  it('renders an avatar with user initials when picture is null', () => {
    renderUserMenu();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('opens the dropdown menu when avatar is clicked', async () => {
    renderUserMenu();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    });
  });

  it('calls startPkceLogout after logout', async () => {
    renderUserMenu();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByText(/sign out/i));
    fireEvent.click(screen.getByText(/sign out/i));
    await waitFor(() => {
      expect(startPkceLogout).toHaveBeenCalledOnce();
    });
  });

  it('clears the auth token on logout', async () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <UserMenu />
        </MemoryRouter>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => screen.getByText(/sign out/i));
    fireEvent.click(screen.getByText(/sign out/i));
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.status).toBe('logging-out');
    vi.restoreAllMocks();
  });
});
