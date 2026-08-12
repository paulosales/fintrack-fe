import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

const accountTarget = process.env.VITE_ACCOUNT_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost';
const importTarget = process.env.VITE_IMPORT_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost';
const currencyTarget = process.env.VITE_CURRENCY_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost';
const settingsTarget = process.env.VITE_SETTINGS_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost';
const keycloakTarget = process.env.VITE_KEYCLOAK_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost:8081';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    https: {},
    proxy: {
      '/realms': {
        target: keycloakTarget,
        changeOrigin: true,
      },
      '/account': {
        target: accountTarget,
        changeOrigin: true,
      },
      '/import': {
        target: importTarget,
        changeOrigin: true,
      },
      '/currency': {
        target: currencyTarget,
        changeOrigin: true,
      },
      '/settings': {
        target: settingsTarget,
        changeOrigin: true,
      },
    },
  },
});
