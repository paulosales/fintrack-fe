import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, AuthUser } from './types';
import { ID_TOKEN_KEY, REFRESH_TOKEN_KEY, refreshAccessToken } from './pkce';

const TOKEN_KEY = 'fintrack-token';

const decodeJwtUser = (token: string): AuthUser | null => {
  try {
    const segment = token.split('.')[1];
    const decoded = JSON.parse(atob(segment.replace(/-/g, '+').replace(/_/g, '/')));
    // `name` is standard; `preferred_username` is the Keycloak fallback.
    const name = decoded.name ?? decoded.preferred_username;
    // `sub` may be absent in Keycloak 24+ if the `basic` scope is not assigned.
    // Fall back to `preferred_username` so login still works.
    const id = decoded.sub ?? decoded.preferred_username;
    if (!id || !name) return null;
    return {
      id,
      email: decoded.email ?? null,
      name,
      picture: decoded.picture ?? null,
    };
  } catch {
    return null;
  }
};

const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = storedToken ? decodeJwtUser(storedToken) : null;

const initialState: AuthState = {
  token: storedUser ? storedToken : null,
  user: storedUser,
  status: storedUser ? 'authenticated' : 'idle',
};

export const refreshAuth = createAsyncThunk('auth/refresh', async () => {
  const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!storedRefreshToken) {
    throw new Error('No refresh token available');
  }
  return refreshAccessToken(storedRefreshToken);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      const token = action.payload;
      const user = decodeJwtUser(token);
      if (user) {
        localStorage.setItem(TOKEN_KEY, token);
        state.token = token;
        state.user = user;
        state.status = 'authenticated';
      } else {
        state.status = 'error';
      }
    },
    sessionExpired(state) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      state.token = null;
      state.user = null;
      state.status = 'idle';
    },
    logout(state) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ID_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      state.token = null;
      state.user = null;
      state.status = 'logging-out';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshAuth.fulfilled, (state, action: PayloadAction<string>) => {
        const token = action.payload;
        const user = decodeJwtUser(token);
        if (user) {
          localStorage.setItem(TOKEN_KEY, token);
          state.token = token;
          state.user = user;
          state.status = 'authenticated';
        } else {
          state.status = 'error';
        }
      })
      .addCase(refreshAuth.rejected, (state) => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        state.token = null;
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { setToken, sessionExpired, logout } = authSlice.actions;
export default authSlice.reducer;
