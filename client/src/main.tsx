import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import './index.css';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Trilha from './pages/Trilha';
import { ProgressProvider } from './context/ProgressContext';

// No app Android (nativo), quem baixou já "entrou" — pula a landing de marketing
// e cai direto no onboarding. Onboarding redireciona pra /trilha se já completou.
// Na web, "/" continua sendo a landing (captação).
const isNative = Capacitor.isNativePlatform();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isNative ? <Navigate to="/onboarding" replace /> : <Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/trilha"
          element={
            <ProgressProvider>
              <Trilha />
            </ProgressProvider>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
