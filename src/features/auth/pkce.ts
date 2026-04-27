/**
 * PKCE (Proof Key for Code Exchange) utilities for Keycloak OIDC login.
 *
 * Used by LoginPage to initiate the authorisation flow and by
 * AuthCallbackPage to exchange the authorisation code for an access token.
 * All browser-redirect logic lives here so the components stay testable.
 */

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? 'http://localhost:8081';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? 'fintrack';
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'fintrack-fe';

const VERIFIER_KEY = 'pkce_verifier';
const STATE_KEY = 'pkce_state';
export const ID_TOKEN_KEY = 'fintrack-id-token';
export const REFRESH_TOKEN_KEY = 'fintrack-refresh-token';

function base64url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Redirect the browser to Keycloak's authorisation endpoint to start a PKCE
 * login flow.
 *
 * @param idpHint - Optional Keycloak identity-provider alias (e.g. `'google'`,
 *                  `'facebook'`).  When provided, Keycloak skips its own login
 *                  page and redirects the user straight to the social provider.
 */
export async function startPkceLogin(idpHint?: string): Promise<void> {
  const verifierBytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = base64url(verifierBytes.buffer as ArrayBuffer);

  const stateBytes = crypto.getRandomValues(new Uint8Array(16));
  const state = base64url(stateBytes.buffer as ArrayBuffer);

  const challengeBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64url(challengeBuffer);

  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const redirectUri = `${window.location.origin}/auth/callback`;
  const baseUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  if (idpHint) {
    params.set('kc_idp_hint', idpHint);
  }

  window.location.href = `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange an OAuth2 authorisation code for a Keycloak access token.
 *
 * Validates the CSRF `state` parameter against the value stored during
 * {@link startPkceLogin} and uses the stored PKCE code verifier.
 * Session storage is cleared regardless of outcome.
 *
 * @returns The RS256 access token issued by Keycloak.
 * @throws  If state validation fails, the verifier is missing, or Keycloak
 *          returns a non-OK response.
 */
export async function exchangeCodeForToken(code: string, state: string): Promise<string> {
  const storedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);

  // Always clear regardless of outcome to prevent replay.
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  if (state !== storedState) {
    throw new Error('OAuth state mismatch — possible CSRF attack');
  }
  if (!verifier) {
    throw new Error('Missing PKCE code verifier');
  }

  const redirectUri = `${window.location.origin}/auth/callback`;
  const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      code,
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
  };
  if (data.id_token) {
    localStorage.setItem(ID_TOKEN_KEY, data.id_token);
  }
  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  }
  return data.access_token;
}

/**
 * Use a refresh token to obtain a new access token from Keycloak.
 *
 * Stores the new refresh token (rotation) and id_token if provided.
 *
 * @returns The new access token.
 * @throws  If Keycloak returns a non-OK response.
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
  };

  if (data.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
  }
  if (data.id_token) {
    localStorage.setItem(ID_TOKEN_KEY, data.id_token);
  }
  return data.access_token;
}

/**
 * Redirect the browser to Keycloak's end-session endpoint to fully terminate
 * the SSO session.  Without this, Keycloak would silently re-authenticate the
 * user the next time ProtectedRoute triggers a login redirect.
 *
 * @param postLogoutRedirectUri - Where Keycloak should send the user after
 *   logout.  Defaults to the app origin.
 */
export function startPkceLogout(postLogoutRedirectUri?: string): void {
  const redirectUri = postLogoutRedirectUri ?? window.location.origin;
  const logoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

  const idToken = localStorage.getItem(ID_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    post_logout_redirect_uri: redirectUri,
  });
  if (idToken) {
    params.set('id_token_hint', idToken);
  }

  window.location.href = `${logoutUrl}?${params.toString()}`;
}
