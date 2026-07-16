import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em dev, proxia as chamadas de API pro backend na VPS (MySQL ao vivo),
// evitando CORS. Em build/native, API_BASE aponta direto pra VPS.
// Pra testar contra API local: VITE_PROXY_TARGET=http://localhost:3008 npm run dev
// Porta 3008 da VPS não é pública (só o nginx local alcança) — o alvo é o domínio.
const API_TARGET = process.env.VITE_PROXY_TARGET || 'https://trilhadev.app.br';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
      '/auth': { target: API_TARGET, changeOrigin: true },
    },
  },
});
