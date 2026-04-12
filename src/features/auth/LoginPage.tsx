import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { startPkceLogin } from './pkce';
import fintrackIcon from '../../assets/icons/fintrack.svg';

const providers = ['google', 'facebook', 'adfs'] as const;
type Provider = (typeof providers)[number];

const providerTranslationKey: Record<Provider, string> = {
  google: 'auth.login.withGoogle',
  facebook: 'auth.login.withFacebook',
  adfs: 'auth.login.withAdfs',
};

/** Keycloak identity-provider alias for each social provider.
 * `adfs` is intentionally absent — "Enterprise SSO" goes directly to Keycloak's
 * own login page (no external IDP redirect needed when Keycloak is the IDP). */
const idpHint: Partial<Record<Provider, string>> = {
  google: 'google',
  facebook: 'facebook',
};

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (provider: Provider) => {
    setLoadingProvider(provider);
    setError(null);
    try {
      await startPkceLogin(idpHint[provider]);
      // Browser redirects to Keycloak — execution only continues in tests.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setLoadingProvider(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Card sx={{ minWidth: 360, maxWidth: 420, p: 2 }}>
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
        >
          <Box component="img" src={fintrackIcon} alt="Fintrack" sx={{ width: 64, height: 64 }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            {t('app.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {t('auth.login.subtitle')}
          </Typography>
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {t('auth.login.error', { error })}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
            {providers.map((provider) => (
              <Button
                key={provider}
                variant="outlined"
                fullWidth
                disabled={loadingProvider !== null}
                onClick={() => void handleLogin(provider)}
                startIcon={
                  loadingProvider === provider ? <CircularProgress size={18} /> : undefined
                }
              >
                {t(providerTranslationKey[provider])}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
