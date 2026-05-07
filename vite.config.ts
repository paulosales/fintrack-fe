import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    https: {},
    proxy: {
      '/realms': {
        target: process.env.VITE_KEYCLOAK_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost',
        changeOrigin: true,
      },
      '/account': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost',
        changeOrigin: true,
      },
      '/import': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost',
        changeOrigin: true,
      },
      '/currency': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost',
        changeOrigin: true,
      },
      '/settings': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost',
        changeOrigin: true,
      },
    },
  },
});
