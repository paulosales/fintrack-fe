import React from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const AuthErrorPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message') ?? 'unknown_error';

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
      </Alert>
      <Button component={RouterLink} to="/login" variant="contained">
        {t('auth.error.backToLogin')}
      </Button>
    </Box>
  );
};

export default AuthErrorPage;
