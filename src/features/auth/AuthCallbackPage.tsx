import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { AppDispatch } from '../../store';
import { setToken } from './authSlice';
import { exchangeCodeForToken } from './pkce';

const AuthCallbackPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    (async () => {
      const code = searchParams.get('code'); // PKCE flow (Keycloak)
      const token = searchParams.get('token'); // Legacy flow (auth-service)
      const state = searchParams.get('state') ?? '';

      if (code) {
        try {
          const accessToken = await exchangeCodeForToken(code, state);
          dispatch(setToken(accessToken));
          navigate('/', { replace: true });
        } catch {
          navigate('/auth/error?message=token_exchange_failed', { replace: true });
        }
      } else if (token) {
        // Legacy path: token was issued by the old auth-service (24 h TTL).
        dispatch(setToken(token));
        navigate('/', { replace: true });
      } else {
        navigate('/auth/error?message=missing_token', { replace: true });
      }
    })();
  }, [dispatch, navigate, searchParams]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography>{t('auth.callback.loading')}</Typography>
    </Box>
  );
};

export default AuthCallbackPage;
