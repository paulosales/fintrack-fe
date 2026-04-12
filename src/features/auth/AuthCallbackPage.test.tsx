import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import AuthCallbackPage from './AuthCallbackPage';
import { exchangeCodeForToken } from './pkce';

vi.mock('./pkce', () => ({
  exchangeCodeForToken: vi.fn(),
}));

// A minimal token whose payload contains the required claims.
// payload = {"sub":"user-1","email":"user@example.com","name":"Test User"}
const VALID_JWT =
  'header.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIn0.sig';

const createStore = () => configureStore({ reducer: { auth: authReducer } });

const renderCallback = (search = '') => {
  const store = createStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/auth/callback${search}`]}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/" element={<div>Home</div>} />
            <Route path="/auth/error" element={<div>Error Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AuthCallbackPage', () => {
  it('shows loading spinner while PKCE code exchange is in progress', () => {
    vi.mocked(exchangeCodeForToken).mockReturnValue(new Promise(() => {}));
    renderCallback('?code=abc&state=xyz');
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('navigates to error page when neither code nor token is present', async () => {
    renderCallback('');
    await waitFor(() => {
      expect(screen.getByText('Error Page')).toBeInTheDocument();
    });
  });

  it('navigates to home on successful PKCE token exchange', async () => {
    vi.mocked(exchangeCodeForToken).mockResolvedValue(VALID_JWT);
    renderCallback('?code=valid-code&state=some-state');
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('navigates to error page when PKCE token exchange fails', async () => {
    vi.mocked(exchangeCodeForToken).mockRejectedValue(new Error('Exchange failed'));
    renderCallback('?code=bad-code&state=some-state');
    await waitFor(() => {
      expect(screen.getByText('Error Page')).toBeInTheDocument();
    });
  });

  it('navigates to home for a legacy token param (24 h grace period)', async () => {
    renderCallback(`?token=${VALID_JWT}`);
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
