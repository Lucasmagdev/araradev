import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getOnboardingPreferences, login, register, setToken, getToken } from '../lib/api';

type Mode = 'login' | 'register';

// Fases agrupadas por nível — cada tier tem cor própria (verde→azul→roxo).
const PHASE_GROUPS: { tier: string; label: string; phases: [string, string][] }[] = [
  {
    tier: 'base',
    label: 'Fundamentos',
    phases: [
      ['01', 'Lógica de programação'],
      ['02', 'Estruturas de dados'],
      ['03', 'Recursão'],
      ['04', 'Algoritmos clássicos'],
    ],
  },
  {
    tier: 'mid',
    label: 'Intermediário',
    phases: [
      ['05', 'SQL e modelagem'],
      ['06', 'Debug & leitura de IA'],
      ['07', 'Testes automatizados'],
      ['08', 'Arquitetura & segurança'],
    ],
  },
  {
    tier: 'top',
    label: 'Avançado',
    phases: [
      ['09', 'APIs REST e HTTP'],
      ['10', 'Git e versionamento'],
      ['11', 'Assíncrono'],
      ['12', 'React e componentes'],
    ],
  },
];

// Ícones SVG (anti-pattern: emoji como ícone). stroke = currentColor.
const ICONS: Record<string, React.ReactNode> = {
  map: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>,
  brain: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0-3 3c0 1 .5 2 1 2.5C3.5 11 3 12 3 13a3 3 0 0 0 3 3c0 1.5 1.5 3 3 3a3 3 0 0 0 3-3z" /><path d="M12 5a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1 3 3c0 1-.5 2-1 2.5.5.5 1 1.5 1 2.5a3 3 0 0 1-3 3c0 1.5-1.5 3-3 3a3 3 0 0 1-3-3z" /></svg>,
  save: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  bolt: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
  target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  chevron: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 4 20 12 6 20 6 4" /></svg>,
  lock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>,
  bolt2: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
};

// Comparativo: o que muda aprender com vs sem dependência de IA.
const COMPARE: { sem: string; com: string }[] = [
  { com: 'Cola o erro no chat e copia a resposta', sem: 'Lê o stack trace e entende a causa' },
  { com: 'Pede o código pronto pro prompt', sem: 'Escreve do zero e sabe o porquê' },
  { com: 'Trava sem internet ou sem crédito', sem: 'Resolve sozinho, em qualquer lugar' },
  { com: 'Passa em tutorial, falha na entrevista', sem: 'Explica decisões com segurança' },
];

const FAQ: [string, string][] = [
  ['Preciso saber programar pra começar?', 'Não. A trilha começa do absoluto zero — lógica e variáveis — e sobe gradual até React e arquitetura. O onboarding ajusta o ponto de partida ao seu nível.'],
  ['É grátis mesmo? Tem pegadinha?', 'Sim, 100% grátis. As 119 lições e 12 fases são liberadas sem pagar nada. Sem cartão, sem trial.'],
  ['Funciona no celular?', 'Funciona. Roda no navegador e também como app Android. Seu progresso fica salvo na conta e sincroniza entre dispositivos.'],
  ['Quanto tempo leva?', '2–3 lições por dia cobrem a trilha de fundamentos em 3–4 semanas. Sem pressa: o ritmo é seu e o progresso nunca se perde.'],
  ['Por que "sem depender de IA"?', 'A IA é ótima ferramenta, mas colar prompt sem entender trava sua evolução. Aqui você treina a debugar e pensar sozinho — depois usa IA como acelerador, não como muleta.'],
];

const FEATURES: [string, string, string][] = [
  ['map', 'Trilha gamificada', 'Cada lição desbloqueada abre a próxima. XP, streak diário e conquistas pra manter o ritmo.'],
  ['brain', 'Fundamentos reais', 'Lógica, estruturas de dados, SQL, algoritmos, debug, testes e arquitetura. O que o mercado cobra.'],
  ['save', 'Progresso salvo', 'Conta própria, progresso vinculado. Continue de qualquer dispositivo, qualquer hora.'],
  ['bolt', 'Ritmo seu', '2–3 lições por dia. Em 3–4 semanas você cobre toda a trilha de fundamentos.'],
];

const STATS: [string, string][] = [
  ['119', 'lições'],
  ['12', 'fases'],
  ['100%', 'gratuito'],
  ['0', 'dependência de IA'],
];

const STEPS: [string, string, string][] = [
  ['target', 'Responda o onboarding', 'Conta seu objetivo e quanto sabe. A trilha se ajusta ao seu ponto de partida.'],
  ['map', 'Siga a trilha', 'Lição a lição, do básico ao avançado. Teoria curta, prática de código e desafios.'],
  ['shield', 'Resolva sem IA', 'Cada exercício treina você a debugar e pensar sozinho — não a depender de prompt.'],
];

export default function Landing() {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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

  // Scroll-reveal: revela elementos [data-reveal] ao entrar na viewport.
  // IntersectionObserver puro — zero dependência, leve pro bundle Android.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

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
            <button className="lp-btn-primary" onClick={startSignup}>Criar conta</button>
          </nav>
        </div>
      </header>

      <main>
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-badge-row">
            <span className="lp-badge-live"><span className="lp-pulse" />Acesso antecipado</span>
            <span className="lp-badge">119 lições · 12 fases · 100% gratuito</span>
          </div>
          <h1 className="lp-headline">
            Aprenda a programar<br />
            <span className="lp-headline-green">de verdade.</span>
          </h1>
          <p className="lp-sub">
            Trilha gamificada do zero aos fundamentos técnicos.
            SQL, algoritmos, debug, testes e arquitetura — sem depender de IA.
          </p>
          <div className="lp-hero-cta">
            <button className="lp-btn-primary lp-btn-lg" onClick={startSignup}>Criar conta grátis</button>
            <a href="#fases" className="lp-btn-ghost lp-btn-lg">Ver trilha ↓</a>
          </div>
        </div>

        <div className="lp-hero-visual" aria-hidden="true">
          <div className="lp-phone">
            <div className="lp-phone-screen">
              <div className="lp-mini-top">
                <span className="lp-mini-brand">
                  <img src="/logoararadev.jpeg" alt="" className="lp-mini-logo" /> AraraDev
                </span>
                <span className="lp-mini-xp">{ICONS.bolt2} 480</span>
              </div>
              <div className="lp-mini-fase">FASE 1 · Lógica de programação</div>
              <div className="lp-mini-trail">
                <div className="lp-mini-node done">{ICONS.check}</div>
                <div className="lp-mini-line" />
                <div className="lp-mini-node done">{ICONS.check}</div>
                <div className="lp-mini-line" />
                <div className="lp-mini-node current">{ICONS.play}</div>
                <div className="lp-mini-label">Loops (for/while)</div>
                <div className="lp-mini-line dim" />
                <div className="lp-mini-node lock">{ICONS.lock}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-stats">
        <div className="lp-container lp-stats-grid">
          {STATS.map(([n, label]) => (
            <div className="lp-stat" key={label}>
              <span className="lp-stat-n">{n}</span>
              <span className="lp-stat-l">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-features">
        <div className="lp-container">
          <h2 className="lp-section-title">Tudo pra aprender de verdade</h2>
          <div className="lp-feature-grid">
            {FEATURES.map(([icon, title, desc], i) => (
              <div className="lp-feature-card" key={title} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="lp-feature-icon">{ICONS[icon]}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-steps">
        <div className="lp-container">
          <h2 className="lp-section-title">Como funciona</h2>
          <div className="lp-steps-grid">
            {STEPS.map(([icon, title, desc], i) => (
              <div className="lp-step" key={title} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="lp-step-num">{i + 1}</div>
                <div className="lp-step-icon">{ICONS[icon]}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-compare">
        <div className="lp-container">
          <h2 className="lp-section-title">Programar sem virar refém da IA</h2>
          <p className="lp-section-sub">
            Prompt resolve a tarefa de hoje. Fundamento resolve sua carreira.
          </p>
          <div className="lp-compare-grid" data-reveal>
            <div className="lp-compare-col bad">
              <div className="lp-compare-head">{ICONS.x}<span>Colado na IA</span></div>
              <ul>
                {COMPARE.map(r => <li key={r.com}>{ICONS.x}<span>{r.com}</span></li>)}
              </ul>
            </div>
            <div className="lp-compare-col good">
              <div className="lp-compare-head">{ICONS.check}<span>Com fundamentos</span></div>
              <ul>
                {COMPARE.map(r => <li key={r.sem}>{ICONS.check}<span>{r.sem}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-preview">
        <div className="lp-container lp-preview-inner">
          <div className="lp-preview-text" data-reveal>
            <h2 className="lp-section-title lp-left">Lição de verdade, não vídeo passivo</h2>
            <p className="lp-section-sub lp-left">
              Teoria curta, código na tela e desafio pra resolver. Você erra, debuga e aprende —
              do jeito que fixa.
            </p>
            <ul className="lp-preview-list">
              <li>{ICONS.check}<span>Explicação direta, sem enrolação</span></li>
              <li>{ICONS.check}<span>Exercício prático a cada lição</span></li>
              <li>{ICONS.check}<span>Feedback na hora, sem precisar de IA</span></li>
            </ul>
          </div>
          <div className="lp-lesson-card" data-reveal aria-hidden="true">
            <div className="lp-lesson-head">
              <span className="lp-lesson-tag">FASE 1 · LIÇÃO 7</span>
              <span className="lp-lesson-xp">{ICONS.bolt2} +20 XP</span>
            </div>
            <h3 className="lp-lesson-q">Qual valor <code>soma</code> imprime?</h3>
            <pre className="lp-code"><code>{`soma = 0
for n in [3, 7, 2]:
    soma += n
print(soma)`}</code></pre>
            <div className="lp-lesson-opts">
              <span className="lp-opt">10</span>
              <span className="lp-opt correct">12{ICONS.check}</span>
              <span className="lp-opt">3</span>
              <span className="lp-opt">Erro</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-phases" id="fases">
        <div className="lp-container">
          <h2 className="lp-section-title">As 12 fases da trilha</h2>
          {PHASE_GROUPS.map(group => (
            <div className={`lp-phase-group tier-${group.tier}`} key={group.tier} data-reveal>
              <div className="lp-phase-group-head">
                <span className="lp-phase-group-dot" />
                <span className="lp-phase-group-label">{group.label}</span>
                <span className="lp-phase-group-range">
                  {group.phases[0][0]}–{group.phases[group.phases.length - 1][0]}
                </span>
              </div>
              <div className="lp-phases-grid">
                {group.phases.map(([num, name]) => (
                  <div className="lp-phase" key={num}>
                    <span className="lp-phase-num">{num}</span>
                    <span className="lp-phase-name">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-faq">
        <div className="lp-container lp-faq-inner">
          <h2 className="lp-section-title">Perguntas frequentes</h2>
          <div className="lp-faq-list">
            {FAQ.map(([q, a], i) => (
              <div className={'lp-faq-item' + (openFaq === i ? ' open' : '')} key={q}>
                <button
                  className="lp-faq-q"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{q}</span>
                  <span className="lp-faq-chevron">{ICONS.chevron}</span>
                </button>
                <div className="lp-faq-a"><p>{a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta-bottom">
        <div className="lp-container lp-cta-inner" data-reveal>
          <h2>Pronto pra começar?</h2>
          <p>Crie sua conta grátis e inicie a trilha agora.</p>
          <button className="lp-btn-primary lp-btn-lg" onClick={startSignup}>Criar conta grátis</button>
        </div>
      </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <span className="lp-brand">
            <img src="/logoararadev.jpeg" className="lp-logo-sm" alt="" />
            <span>AraraDev</span>
          </span>
          <span className="lp-footer-copy">Trilha de fundamentos técnicos</span>
        </div>
      </footer>

      {/* CTA fixo só no mobile — sempre à mão durante o scroll */}
      <div className="lp-sticky-cta">
        <button className="lp-btn-primary lp-btn-lg" onClick={startSignup}>Criar conta grátis</button>
      </div>

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
