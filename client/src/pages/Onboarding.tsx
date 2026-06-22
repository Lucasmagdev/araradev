import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getOnboardingPreferences, getToken, login, register, saveOnboardingPreferences, setToken } from '../lib/api';
import type { OnboardingPreferences } from '../types';

const TOTAL_STEPS = 6;

const goals = [
  ['dev', 'Quero virar dev'],
  ['ai-autonomy', 'Quero depender menos da IA'],
  ['logic', 'Quero reforçar lógica'],
  ['work-study', 'Preciso para trabalho/faculdade'],
  ['practice', 'Só quero praticar'],
];

const confidence = [
  ['stuck-with-ai', 'Quando a IA trava, eu travo junto'],
  ['little-confidence', 'Falta confiança para resolver sozinho'],
  ['some-basis', 'Tenho base, mas quero firmar'],
  ['confident', 'Já me viro, quero evoluir'],
];

const times = [
  ['daily-15', '15 min por dia'],
  ['daily-30', '30 min por dia'],
  ['weekly-1h', '1 hora por semana'],
  ['not-sure', 'Ainda não tenho certeza'],
];

const styles = [
  ['theory-first', 'Teoria rápida primeiro'],
  ['practice-first', 'Direto para prática'],
];

const interests = [
  ['web', 'Web'],
  ['backend', 'Backend'],
  ['apps', 'Aplicativos'],
  ['automation', 'Automação'],
  ['data', 'Dados'],
  ['ai', 'IA com programação'],
];

const defaults: OnboardingPreferences = {
  goal: '',
  confidence: '',
  time: '',
  style: '',
  interests: [],
};

function StepHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <div className="ob-top">
      <div className="ob-progress"><div className="ob-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} /></div>
      {step > 1 && <button className="ob-back" onClick={onBack} aria-label="Voltar">‹</button>}
      <span className="ob-count">{step}/{TOTAL_STEPS}</span>
    </div>
  );
}

function OptionButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button className={'ob-option' + (active ? ' active' : '')} onClick={onClick}>{children}</button>;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(() => !getToken());
  const [hasAuth, setHasAuth] = useState(false);
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<OnboardingPreferences>(defaults);
  const [saving, setSaving] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [account, setAccount] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  // Login pra quem já tem conta (reinstalou o app / trocou de aparelho).
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    if (!getToken()) return;

    getMe()
      .then(() => getOnboardingPreferences())
      .then(existing => {
        if (existing?.completedAt) navigate('/trilha', { replace: true });
        else {
          setHasAuth(true);
          setAuthChecked(true);
        }
      })
      .catch(() => {
        setHasAuth(false);
        setAuthChecked(true);
      });
  }, [navigate]);

  const selectedGoalLabel = useMemo(() => goals.find(([id]) => id === prefs.goal)?.[1] || 'seu objetivo', [prefs.goal]);

  function setSingle(key: 'goal' | 'confidence' | 'time' | 'style', value: string) {
    setPrefs(p => ({ ...p, [key]: value }));
    setTimeout(() => setStep(s => Math.min(TOTAL_STEPS, s + 1)), 160);
  }

  function toggleInterest(value: string) {
    setPrefs(p => ({
      ...p,
      interests: p.interests.includes(value)
        ? p.interests.filter(x => x !== value)
        : [...p.interests, value],
    }));
  }

  function finish() {
    setLoadPct(0);
    setSaving(true);
    // Quem já está logado salva agora; o avanço é controlado pela animação 0→100%.
    if (hasAuth) void saveOnboardingPreferences({ ...prefs, completedAt: Date.now() });
  }

  // Anima a barra/anel de "Montando sua trilha" e só avança ao chegar em 100%.
  useEffect(() => {
    if (!saving) return;
    let pct = 0;
    const id = window.setInterval(() => {
      pct = Math.min(100, pct + 2);
      setLoadPct(pct);
      if (pct >= 100) {
        window.clearInterval(id);
        if (hasAuth) navigate('/trilha', { replace: true });
        else { setSaving(false); setStep(7); }
      }
    }, 30);
    return () => window.clearInterval(id);
  }, [saving, hasAuth, navigate]);

  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const name = account.name.trim();
    const email = account.email.trim();
    const password = account.password;

    if (!name) { setError('Informe seu nome.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email invalido.'); return; }
    if (password.length < 6) { setError('Senha precisa de no minimo 6 caracteres.'); return; }

    setSaving(true);
    try {
      const res = await register(name, email, password);
      setToken(res.token);
      await saveOnboardingPreferences({ ...prefs, completedAt: Date.now() });
      navigate('/trilha', { replace: true });
    } catch (err) {
      setSaving(false);
      setError((err as Error).message || 'Erro ao criar conta. Tente novamente.');
    }
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    const email = loginData.email.trim();
    const password = loginData.password;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setLoginError('Email invalido.'); return; }
    if (password.length < 6) { setLoginError('Senha precisa de no minimo 6 caracteres.'); return; }
    setLoginBusy(true);
    try {
      const res = await login(email, password);
      setToken(res.token);
      const existing = await getOnboardingPreferences().catch(() => null);
      navigate(existing?.completedAt ? '/trilha' : '/onboarding', { replace: true });
      if (existing?.completedAt) return;
      // tem conta mas nunca completou onboarding: segue o questionario logado
      setHasAuth(true);
      setLoginOpen(false);
      setLoginBusy(false);
    } catch (err) {
      setLoginBusy(false);
      setLoginError((err as Error).message || 'Email ou senha incorretos.');
    }
  }

  if (!authChecked) {
    return <div className="ob-page"><div className="ob-loading">Carregando...</div></div>;
  }

  return (
    <main className="ob-page">
      {step < 6 && <StepHeader step={step} onBack={() => setStep(s => Math.max(1, s - 1))} />}

      {step === 1 && (
        <section className="ob-card intro">
          <img src="/logoararadev.jpeg" className="ob-mascot" alt="TrilhaDev" />
          <h1>Vamos montar sua trilha?</h1>
          <p>Antes de começar, responda rapidinho para o TrilhaDev ajustar ritmo, foco e ponto de partida.</p>
          <button className="ob-primary" onClick={() => setStep(2)}>Continuar</button>
          <button className="ob-login-link" onClick={() => { setLoginError(''); setLoginOpen(true); }}>Já tenho conta? Entrar</button>
        </section>
      )}

      {step === 2 && (
        <section className="ob-card">
          <h1>Por que você quer aprender programação?</h1>
          <div className="ob-options">
            {goals.map(([id, label]) => <OptionButton key={id} active={prefs.goal === id} onClick={() => setSingle('goal', id)}>{label}</OptionButton>)}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="ob-card">
          <h1>Como você se sente hoje com código?</h1>
          <p className="ob-sub">Isso ajuda a trilha começar no nível certo, sem pular fundamento.</p>
          <div className="ob-options">
            {confidence.map(([id, label]) => <OptionButton key={id} active={prefs.confidence === id} onClick={() => setSingle('confidence', id)}>{label}</OptionButton>)}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="ob-card">
          <h1>Quanto tempo você quer dedicar?</h1>
          <div className="ob-options">
            {times.map(([id, label]) => <OptionButton key={id} active={prefs.time === id} onClick={() => setSingle('time', id)}>{label}</OptionButton>)}
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="ob-card">
          <h1>Você prefere começar como?</h1>
          <div className="ob-options compact">
            {styles.map(([id, label]) => <OptionButton key={id} active={prefs.style === id} onClick={() => setSingle('style', id)}>{label}</OptionButton>)}
          </div>
          <div className="ob-reassurance">
            <strong>Sem pressão.</strong>
            <span>A trilha sempre mistura explicação curta, prática e revisão.</span>
          </div>
        </section>
      )}

      {step === 6 && !saving && (
        <section className="ob-card">
          <StepHeader step={6} onBack={() => setStep(5)} />
          <h1>Quais áreas te interessam?</h1>
          <p className="ob-sub">Você pode escolher mais de uma opção.</p>
          <div className="ob-options">
            {interests.map(([id, label]) => <OptionButton key={id} active={prefs.interests.includes(id)} onClick={() => toggleInterest(id)}>{label}</OptionButton>)}
          </div>
          <button className="ob-primary bottom" disabled={prefs.interests.length === 0} onClick={finish}>Montar minha trilha</button>
        </section>
      )}

      {step === 6 && saving && (
        <section className="ob-card analyzing">
          <h1>Montando sua trilha TrilhaDev</h1>
          <div className="ob-ring" style={{ background: `conic-gradient(var(--green) 0 ${loadPct}%, rgba(255,255,255,0.12) ${loadPct}% 100%)` }}><span>{loadPct}%</span></div>
          <div className="ob-checklist">
            <span style={{ opacity: loadPct > 15 ? 1 : 0.35 }}>{loadPct > 15 ? '✓' : '⋯'} Analisando {selectedGoalLabel.toLowerCase()}</span>
            <span style={{ opacity: loadPct > 40 ? 1 : 0.35 }}>{loadPct > 40 ? '✓' : '⋯'} Ajustando seu ritmo de estudo</span>
            <span style={{ opacity: loadPct > 65 ? 1 : 0.35 }}>{loadPct > 65 ? '✓' : '⋯'} Definindo ponto de partida</span>
            <span style={{ opacity: loadPct > 90 ? 1 : 0.35 }}>{loadPct > 90 ? '✓' : '⋯'} Preparando exercícios sem muleta de IA</span>
          </div>
        </section>
      )}

      {step === 7 && (
        <section className="ob-card account">
          <img src="/logoararadev.jpeg" className="ob-mascot" alt="TrilhaDev" />
          <h1>Sua trilha esta pronta</h1>
          <p>Crie sua conta gratis para salvar o plano, XP, vidas e progresso.</p>
          <form className="ob-account-form" onSubmit={createAccount}>
            <div className="auth-field">
              <label>Nome</label>
              <input
                type="text"
                value={account.name}
                onChange={e => setAccount(a => ({ ...a, name: e.target.value }))}
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={account.email}
                onChange={e => setAccount(a => ({ ...a, email: e.target.value }))}
                placeholder="seu@email.com"
                autoComplete="email"
                inputMode="email"
              />
            </div>
            <div className="auth-field">
              <label>Senha</label>
              <div className="auth-pass">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={account.password}
                  onChange={e => setAccount(a => ({ ...a, password: e.target.value }))}
                  placeholder="Minimo 6 caracteres"
                  autoComplete="new-password"
                />
                <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(s => !s)} aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
                  {showPass ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            {error && <p className="auth-error" style={{ display: 'block' }}>{error}</p>}
            <button type="submit" className="ob-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Criar conta e comecar'}
            </button>
          </form>
          <button className="ob-login-link" onClick={() => { setLoginError(''); setLoginOpen(true); }}>Já tenho conta? Entrar</button>
        </section>
      )}

      {loginOpen && (
        <div className="auth-overlay" onClick={(e) => { if (e.target === e.currentTarget) setLoginOpen(false); }}>
          <div className="auth-card">
            <button className="auth-close" onClick={() => setLoginOpen(false)}>✕</button>
            <div className="auth-brand">
              <img src="/logoararadev.jpeg" className="auth-logo" alt="TrilhaDev" />
              <span className="auth-brand-name">TrilhaDev</span>
            </div>
            <h2 style={{ textAlign: 'center', margin: '0 0 16px' }}>Entrar</h2>
            <form onSubmit={doLogin}>
              <div className="auth-field">
                <label>Email</label>
                <input type="email" value={loginData.email} onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))} placeholder="seu@email.com" autoComplete="email" inputMode="email" />
              </div>
              <div className="auth-field">
                <label>Senha</label>
                <div className="auth-pass">
                  <input type={showPass ? 'text' : 'password'} value={loginData.password} onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))} placeholder="Sua senha" autoComplete="current-password" />
                  <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(s => !s)} aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
              {loginError && <p className="auth-error" style={{ display: 'block' }}>{loginError}</p>}
              <button type="submit" className="auth-btn" disabled={loginBusy}>
                {loginBusy ? 'Entrando...' : 'ENTRAR'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
