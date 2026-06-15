// Web Audio API sound effects (no external files) + confetti.

let _audioCtx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    _audioCtx = new Ctx();
  }
  return _audioCtx;
}

export function playSound(type: 'correct' | 'wrong' | 'complete') {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const note = (freq: number, start: number, dur: number, vol: number, wave: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, now + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    };

    if (type === 'correct') {
      note(523.25, 0,    0.18, 0.3);
      note(659.25, 0.1,  0.18, 0.28);
      note(783.99, 0.2,  0.28, 0.25);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now); osc.stop(now + 0.45);
    } else if (type === 'complete') {
      note(523.25, 0,    0.25, 0.22);
      note(659.25, 0.12, 0.25, 0.2);
      note(783.99, 0.24, 0.25, 0.18);
      note(1046.5, 0.36, 0.5,  0.22);
    }
  } catch { /* ignore */ }
}

export function launchConfetti() {
  const overlay = document.createElement('div');
  overlay.id = 'confetti-overlay';
  document.body.appendChild(overlay);
  const colors = ['#58cc02', '#ffc800', '#ff4b4b', '#1cb0f6', '#ce82ff'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-delay:${(Math.random() * 1.5).toFixed(2)}s;animation-duration:${(1.5 + Math.random() * 2).toFixed(2)}s;width:${Math.round(5 + Math.random() * 8)}px;height:${Math.round(5 + Math.random() * 8)}px;border-radius:${Math.random() > .5 ? '50%' : '2px'};`;
    overlay.appendChild(p);
  }
  setTimeout(() => overlay.remove(), 5500);
}

export function runCodeTests(funcName: string, code: string, tests: { args: unknown[]; expected: unknown }[]) {
  let fn: unknown;
  try {
    fn = new Function(`${code}\n;return ${funcName};`)();
    if (typeof fn !== 'function') throw new Error(`função "${funcName}" não encontrada`);
  } catch (e) {
    return { error: `Erro ao carregar seu código: ${(e as Error).message}`, results: [] as TestResult[] };
  }

  const results: TestResult[] = tests.map((t) => {
    try {
      const actual = (fn as (...a: unknown[]) => unknown)(...t.args);
      return { ...t, actual, pass: JSON.stringify(actual) === JSON.stringify(t.expected) };
    } catch (e) {
      return { ...t, actual: `Erro: ${(e as Error).message}`, pass: false };
    }
  });

  return { error: null as string | null, results };
}

export interface TestResult {
  args: unknown[];
  expected: unknown;
  actual: unknown;
  pass: boolean;
}
