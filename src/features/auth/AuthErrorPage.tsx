import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { startPkceLogin } from './pkce';

const AuthErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') ?? 'unknown_error';
  const detail = searchParams.get('detail');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 3,
        p: 2,
      }}
    >
      <Typography variant="h5" component="h1">
        {t('auth.error.title')}
      </Typography>
      <Alert severity="error" sx={{ maxWidth: 480, width: '100%' }}>
        {message}
        {detail && (
          <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all', opacity: 0.8 }}>
            {decodeURIComponent(detail)}
          </Typography>
        )}
      </Alert>
      <Button onClick={() => void startPkceLogin()} variant="contained">
        {t('auth.error.backToLogin')}
      </Button>
    </Box>
  );
};

export default AuthErrorPage;
