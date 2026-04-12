export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  picture: string | null;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
}
