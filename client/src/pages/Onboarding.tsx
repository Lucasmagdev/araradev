import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getOnboardingPreferences, saveOnboardingPreferences } from '../lib/api';
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
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<OnboardingPreferences>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMe()
      .then(() => getOnboardingPreferences())
      .then(existing => {
        if (existing?.completedAt) navigate('/trilha', { replace: true });
        else setAuthChecked(true);
      })
      .catch(() => navigate('/', { replace: true }));
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

  async function finish() {
    setSaving(true);
    const payload = { ...prefs, completedAt: Date.now() };
    await saveOnboardingPreferences(payload);
    setTimeout(() => navigate('/trilha', { replace: true }), 1800);
  }

  if (!authChecked) {
    return <div className="ob-page"><div className="ob-loading">Carregando...</div></div>;
  }

  return (
    <main className="ob-page">
      {step < 6 && <StepHeader step={step} onBack={() => setStep(s => Math.max(1, s - 1))} />}

      {step === 1 && (
        <section className="ob-card intro">
          <img src="/logoararadev.jpeg" className="ob-mascot" alt="AraraDev" />
          <h1>Vamos montar sua trilha?</h1>
          <p>Antes de começar, responda rapidinho para o AraraDev ajustar ritmo, foco e ponto de partida.</p>
          <button className="ob-primary" onClick={() => setStep(2)}>Continuar</button>
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
          <h1>Montando sua trilha AraraDev</h1>
          <div className="ob-ring"><span>100%</span></div>
          <div className="ob-checklist">
            <span>✓ Analisando {selectedGoalLabel.toLowerCase()}</span>
            <span>✓ Ajustando seu ritmo de estudo</span>
            <span>✓ Definindo ponto de partida</span>
            <span>✓ Preparando exercícios sem muleta de IA</span>
          </div>
        </section>
      )}
    </main>
  );
}
