import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { initNative } from './lib/native';
import { initErrorReporting } from './lib/errlog';
import './index.css';

initNative();
initErrorReporting();

// Cada rota vira um chunk separado: a landing não baixa o código da trilha
// (+119 lições, ProgressProvider) e vice-versa. Carregam sob demanda.
const Landing = lazy(() => import('./pages/Landing'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Trilha = lazy(() => import('./pages/Trilha'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const TechIndex = lazy(() => import('./pages/TechIndex'));
const TechPage = lazy(() => import('./pages/TechPage'));

// No app Android (nativo), quem baixou já "entrou" — pula a landing de marketing
// e cai direto no onboarding. Onboarding redireciona pra /trilha se já completou.
// Na web, "/" continua sendo a landing (captação). /blog e /aprenda são só
// marketing/SEO, não fazem parte do fluxo nativo (mesmo motivo do /blog).
const isNative = Capacitor.isNativePlatform();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
        <Routes>
          <Route path="/" element={isNative ? <Navigate to="/onboarding" replace /> : <Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/trilha" element={<Trilha />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/aprenda" element={<TechIndex />} />
          <Route path="/aprenda/:slug" element={<TechPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
