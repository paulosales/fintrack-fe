import { refreshAuth } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../store';

interface ThunkApi {
  dispatch: AppDispatch;
  getState: () => RootState;
}

/**
 * Wrapper around `fetch` that automatically attaches the Bearer token from the
 * Redux auth state.  On a 401 response it attempts a token refresh once; if
 * the refresh succeeds the original request is retried with the new token.
 * If the refresh fails, `refreshAuth.rejected` is handled by `authSlice` which
 * clears the auth state and causes `ProtectedRoute` to redirect to login.
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit,
  { dispatch, getState }: ThunkApi
): Promise<Response> {
  const getAuthHeaders = (): Record<string, string> => {
    const token = getState().auth.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers, ...getAuthHeaders() },
  });

  if (response.status !== 401) {
    return response;
  }

  const result = await dispatch(refreshAuth());
  if (!refreshAuth.fulfilled.match(result)) {
    // Refresh failed; authSlice already cleared state → ProtectedRoute redirects to login.
    return response;
  }

  // Retry with the newly obtained token.
  return fetch(url, {
    ...options,
    headers: { ...options.headers, ...getAuthHeaders() },
  });
}
