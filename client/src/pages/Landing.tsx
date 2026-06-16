import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getOnboardingPreferences, login, register, setToken, getToken } from '../lib/api';

type Mode = 'login' | 'register';

const PHASES: [string, string][] = [
  ['01', 'Lógica de programação'],
  ['02', 'Estruturas de dados'],
  ['03', 'Recursão'],
  ['04', 'Algoritmos clássicos'],
  ['05', 'SQL'],
  ['06', 'Debug & IA'],
  ['07', 'Testes'],
  ['08', 'Arquitetura & segurança'],
];

const FEATURES: [string, string, string][] = [
  ['🗺️', 'Trilha gamificada', 'Cada lição desbloqueada abre a próxima. XP, streak diário e conquistas pra manter o ritmo.'],
  ['🧠', 'Fundamentos reais', 'Lógica, estruturas de dados, SQL, algoritmos, debug, testes e arquitetura. O que o mercado cobra.'],
  ['💾', 'Progresso salvo', 'Conta própria, progresso vinculado. Continue de qualquer dispositivo, qualquer hora.'],
  ['⚡', 'Ritmo seu', '2–3 lições por dia. Em 3–4 semanas você cobre toda a trilha de fundamentos.'],
];

export default function Landing() {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  // Already logged in? Go to trilha.
  useEffect(() => {
    if (!getToken()) return;
    getMe()
      .then(() => getOnboardingPreferences())
      .then(prefs => navigate(prefs?.completedAt ? '/trilha' : '/onboarding'))
      .catch(() => {});
  }, [navigate]);

  function open(m: Mode) {
    setMode(m);
    setError('');
    setAuthOpen(true);
    setTimeout(() => (m === 'login' ? emailRef.current : nameRef.current)?.focus(), 50);
  }

  function startSignup() {
    navigate('/onboarding');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const email = emailRef.current!.value.trim();
      const password = passRef.current!.value;
      const name = nameRef.current?.value.trim() || '';
      // validação client-side antes de bater na API
      if (mode === 'register' && !name) { setError('Informe seu nome.'); setBusy(false); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email inválido.'); setBusy(false); return; }
      if (password.length < 6) { setError('Senha precisa de no mínimo 6 caracteres.'); setBusy(false); return; }
      const res = mode === 'login' ? await login(email, password) : await register(name, email, password);
      if (res.token) setToken(res.token);
      if (mode === 'register') {
        navigate('/onboarding');
        return;
      }
      const prefs = await getOnboardingPreferences().catch(() => null);
      navigate(prefs?.completedAt ? '/trilha' : '/onboarding');
    } catch (err) {
      setError((err as Error).message || 'Erro de conexão. Tente novamente.');
      setBusy(false);
    }
  }

  return (
    <div className="lp-page">
      <div className="lp-bg" aria-hidden="true">
        <div className="lp-bg-aurora a1" />
        <div className="lp-bg-aurora a2" />
        <div className="lp-bg-aurora a3" />
        <div className="lp-bg-aurora a4" />
      </div>

      <header className="lp-header">
        <div className="lp-header-inner">
          <a href="/" className="lp-brand">
            <img src="/logoararadev.jpeg" className="lp-logo" alt="AraraDev" />
            <span className="lp-brand-name">AraraDev</span>
          </a>
          <nav className="lp-nav">
            <button className="lp-btn-ghost" onClick={() => open('login')}>Entrar</button>
            <button className="lp-btn-primary" onClick={startSignup}>Cadastre-se</button>
          </nav>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-badge">59 lições · 8 fases · 100% gratuito</div>
          <h1 className="lp-headline">
            Aprenda a programar<br />
            <span className="lp-headline-green">de verdade.</span>
          </h1>
          <p className="lp-sub">
            Trilha gamificada do zero aos fundamentos técnicos.
            SQL, algoritmos, debug, testes e arquitetura — sem depender de IA.
          </p>
          <div className="lp-hero-cta">
            <button className="lp-btn-primary lp-btn-lg" onClick={startSignup}>Começar agora</button>
            <a href="#fases" className="lp-btn-ghost lp-btn-lg">Ver trilha ↓</a>
          </div>
        </div>

        <div className="lp-hero-visual" aria-hidden="true">
          <div className="lp-phone">
            <div className="lp-phone-screen">
              <div className="lp-mini-top">
                <span className="lp-mini-brand">🦜 AraraDev</span>
                <span className="lp-mini-xp">⚡ 480</span>
              </div>
              <div className="lp-mini-fase">FASE 1 · Lógica de programação</div>
              <div className="lp-mini-trail">
                <div className="lp-mini-node done">✓</div>
                <div className="lp-mini-line" />
                <div className="lp-mini-node done">✓</div>
                <div className="lp-mini-line" />
                <div className="lp-mini-node current">▶</div>
                <div className="lp-mini-label">Loops (for/while)</div>
                <div className="lp-mini-line dim" />
                <div className="lp-mini-node lock">🔒</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-features">
        <div className="lp-container">
          <div className="lp-feature-grid">
            {FEATURES.map(([icon, title, desc]) => (
              <div className="lp-feature-card" key={title}>
                <div className="lp-feature-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-phases" id="fases">
        <div className="lp-container">
          <h2 className="lp-section-title">As 8 fases da trilha</h2>
          <div className="lp-phases-grid">
            {PHASES.map(([num, name]) => (
              <div className="lp-phase" key={num}>
                <span className="lp-phase-num">{num}</span>
                <span className="lp-phase-name">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta-bottom">
        <div className="lp-container lp-cta-inner">
          <h2>Pronto pra começar?</h2>
          <p>Crie sua conta grátis e inicie a trilha agora.</p>
          <button className="lp-btn-primary lp-btn-lg" onClick={startSignup}>Criar conta grátis</button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <span className="lp-brand">
            <img src="/logoararadev.jpeg" className="lp-logo-sm" alt="" />
            <span>AraraDev</span>
          </span>
          <span className="lp-footer-copy">Trilha de fundamentos técnicos</span>
        </div>
      </footer>

      {authOpen && (
        <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAuthOpen(false); }}>
          <div className="auth-card">
            <button className="auth-close" onClick={() => setAuthOpen(false)}>✕</button>
            <div className="auth-brand">
              <img src="/logoararadev.jpeg" className="auth-logo" alt="AraraDev" />
              <span className="auth-brand-name">AraraDev</span>
            </div>

            <div className="auth-tabs">
              <button className={'auth-tab' + (mode === 'login' ? ' active' : '')} onClick={() => { setMode('login'); setError(''); }}>Entrar</button>
              <button className={'auth-tab' + (mode === 'register' ? ' active' : '')} onClick={() => { setMode('register'); setError(''); }}>Criar conta</button>
            </div>

            <form onSubmit={submit}>
              {mode === 'register' && (
                <div className="auth-field">
                  <label>Nome</label>
                  <input ref={nameRef} type="text" placeholder="Seu nome" autoComplete="name" />
                </div>
              )}
              <div className="auth-field">
                <label>Email</label>
                <input ref={emailRef} type="email" placeholder="seu@email.com" autoComplete="email" inputMode="email" />
              </div>
              <div className="auth-field">
                <label>Senha</label>
                <div className="auth-pass">
                  <input ref={passRef} type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(s => !s)} aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              {error && <p className="auth-error" style={{ display: 'block' }}>{error}</p>}
              <button type="submit" className="auth-btn" disabled={busy}>
                {mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
