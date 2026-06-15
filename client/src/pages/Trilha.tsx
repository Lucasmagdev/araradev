import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LESSONS } from '../data/lessons';
import type { Lesson } from '../types';
import { useProgress } from '../context/ProgressContext';
import { getMe } from '../lib/api';
import Header from '../components/Header';
import BottomNav, { type NavKey } from '../components/BottomNav';
import Path from '../components/Path';
import LessonScreen from '../components/LessonScreen';
import LessonModal from '../components/LessonModal';
import { ProfileModal, AchievementsModal, SettingsModal, PhaseCompleteModal } from '../components/Modals';
import Toasts, { type Toast } from '../components/Toasts';
import { launchConfetti } from '../lib/effects';

export default function Trilha() {
  const navigate = useNavigate();
  const { markComplete } = useProgress();

  const [authChecked, setAuthChecked] = useState(false);
  const [nav, setNav] = useState<NavKey>('trilha');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingPhase, setPendingPhase] = useState<string | null>(null);
  const toastId = useRef(0);

  useEffect(() => {
    getMe().then(() => setAuthChecked(true)).catch(() => navigate('/', { replace: true }));
  }, [navigate]);

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

  function onNav(k: NavKey) {
    setNav(k);
    if (k === 'trilha') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <div id="app-shell">
        <Header />
        <Path onOpenLesson={setOpenIndex} />
        <BottomNav active={nav} onNav={onNav} />
      </div>

      {lesson && isTheoryQuiz && (
        <LessonScreen lesson={lesson} onComplete={handleComplete} onClose={closeLesson} />
      )}
      {lesson && !isTheoryQuiz && (
        <LessonModal lesson={lesson} onComplete={handleComplete} onClose={closeLesson} />
      )}

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
