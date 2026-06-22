import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LESSONS } from '../data/lessons';
import type { Lesson, OnboardingPreferences } from '../types';
import { useProgress } from '../context/ProgressContext';
import { getMe, getOnboardingPreferences } from '../lib/api';

const GOAL_MSG: Record<string, string> = {
  'dev': 'Seu plano foca em virar dev: base sólida primeiro — lógica, estruturas, algoritmos e projetos.',
  'ai-autonomy': 'Seu plano foca em autonomia: resolver código sem depender da IA. Tudo começa pela lógica.',
  'logic': 'Foco em firmar sua lógica: loops, acumulador e funções — a base que destrava o resto.',
  'work-study': 'Foco no que trabalho e faculdade cobram: lógica, SQL e algoritmos aplicados.',
  'practice': 'Bora praticar: lições curtas e diretas, no seu ritmo.',
};
const BANNER_KEY = 'araradev_trail_banner_dismissed';
import Header from '../components/Header';
import BottomNav, { type NavKey } from '../components/BottomNav';
import Path from '../components/Path';
import LessonScreen from '../components/LessonScreen';
import FillScreen from '../components/FillScreen';
import LessonModal from '../components/LessonModal';
import { ProfileModal, AchievementsModal, SettingsModal, PhaseCompleteModal, DailyChallengeModal, RankingModal } from '../components/Modals';
import Toasts, { type Toast } from '../components/Toasts';
import { launchConfetti } from '../lib/effects';

export default function Trilha() {
  const navigate = useNavigate();
  const { progress, markComplete } = useProgress();

  const [authChecked, setAuthChecked] = useState(false);
  const [nav, setNav] = useState<NavKey>('trilha');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingPhase, setPendingPhase] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<OnboardingPreferences | null>(null);
  const [bannerOff, setBannerOff] = useState(() => localStorage.getItem(BANNER_KEY) === '1');
  const toastId = useRef(0);

  useEffect(() => {
    getMe()
      .then(() => getOnboardingPreferences())
      .then(p => {
        if (!p?.completedAt) navigate('/onboarding', { replace: true });
        else { setPrefs(p); setAuthChecked(true); }
      })
      .catch(() => navigate('/', { replace: true }));
  }, [navigate]);

  function dismissBanner() {
    setBannerOff(true);
    localStorage.setItem(BANNER_KEY, '1');
  }

  const addToast = useCallback((html: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, html }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const handleComplete = useCallback((lesson: Lesson) => {
    const res = markComplete(lesson.id, lesson.xp);
    res.newBadges.forEach(b => addToast(`${b.icon} Conquista desbloqueada: <strong>${b.name}</strong>`));
    if (res.phaseComplete) setPendingPhase(res.phaseComplete);
  }, [markComplete, addToast]);

  const openLesson = useCallback((index: number) => {
    const lesson = LESSONS[index];
    if (!progress.completed[lesson.id] && progress.credits.current <= 0) {
      addToast('Sem vidas agora. Elas recarregam automaticamente a cada <strong>48h</strong>.');
      return;
    }
    setOpenIndex(index);
  }, [addToast, progress.completed, progress.credits]);

  const closeLesson = useCallback(() => {
    setOpenIndex(null);
    if (pendingPhase) {
      setTimeout(() => launchConfetti(), 100);
    }
  }, [pendingPhase]);

  if (!authChecked) {
    return <div id="app-shell" style={{ alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Carregando…</div>;
  }

  const lesson = openIndex !== null ? LESSONS[openIndex] : null;
  const isTheoryQuiz = lesson?.type === 'theory' && (lesson.quiz?.length ?? 0) > 0;
  const isFill = lesson?.type === 'fill';

  function onNav(k: NavKey) {
    setNav(k);
    if (k === 'trilha') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <div id="app-shell">
        <Header />
        {!bannerOff && prefs?.goal && (
          <div className="trail-banner">
            <span className="trail-banner-ico">🎯</span>
            <p>{GOAL_MSG[prefs.goal] || 'Sua trilha começa pela lógica e avança no seu ritmo.'}</p>
            <button className="trail-banner-close" onClick={dismissBanner} aria-label="Fechar">✕</button>
          </div>
        )}
        <Path onOpenLesson={openLesson} />
        <BottomNav active={nav} onNav={onNav} />
      </div>

      {lesson && isTheoryQuiz && (
        <LessonScreen lesson={lesson} onComplete={handleComplete} onClose={closeLesson} />
      )}
      {lesson && isFill && (
        <FillScreen lesson={lesson} onComplete={handleComplete} onClose={closeLesson} />
      )}
      {lesson && !isTheoryQuiz && !isFill && (
        <LessonModal lesson={lesson} onComplete={handleComplete} onClose={closeLesson} />
      )}

      {nav === 'diario' && <DailyChallengeModal onClose={() => setNav('trilha')} onToast={addToast} />}
      {nav === 'ranking' && <RankingModal onClose={() => setNav('trilha')} />}
      {nav === 'perfil' && <ProfileModal onClose={() => setNav('trilha')} />}
      {nav === 'conquistas' && <AchievementsModal onClose={() => setNav('trilha')} />}
      {nav === 'config' && <SettingsModal onClose={() => setNav('trilha')} />}

      {pendingPhase && openIndex === null && (
        <PhaseCompleteModal unit={pendingPhase} onClose={() => setPendingPhase(null)} />
      )}

      <Toasts toasts={toasts} />
    </>
  );
}
