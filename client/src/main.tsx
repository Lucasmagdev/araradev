import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import './index.css';

// Cada rota vira um chunk separado: a landing não baixa o código da trilha
// (+119 lições, ProgressProvider) e vice-versa. Carregam sob demanda.
const Landing = lazy(() => import('./pages/Landing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Trilha = lazy(() => import('./pages/Trilha'));

// No app Android (nativo), quem baixou já "entrou" — pula a landing de marketing
// e cai direto no onboarding. Onboarding redireciona pra /trilha se já completou.
// Na web, "/" continua sendo a landing (captação).
const isNative = Capacitor.isNativePlatform();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Routes>
          <Route path="/" element={isNative ? <Navigate to="/onboarding" replace /> : <Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/trilha" element={<Trilha />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
