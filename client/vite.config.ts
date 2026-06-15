import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em dev, proxia as chamadas de API pro backend na VPS (MySQL ao vivo),
// evitando CORS. Em build/native, API_BASE aponta direto pra VPS.
const API_TARGET = 'http://80.241.218.217:3008';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      '/auth': { target: API_TARGET, changeOrigin: true },
    },
  },
});
