import { describe, it, expect } from 'vitest';
import {
  MAX_CREDITS,
  CREDIT_RECHARGE_MS,
  getLevel,
  emptyProgress,
  consumeCredit,
  rechargeCredits,
  normalizeProgress,
  formatCreditTimer,
  bumpStreak,
} from './progress';

describe('níveis (getLevel)', () => {
  it('mapeia XP pra faixa certa', () => {
    expect(getLevel(0).name).toBe('Iniciante');
    expect(getLevel(99).name).toBe('Iniciante');
    expect(getLevel(100).name).toBe('Aprendiz');
    expect(getLevel(500).name).toBe('Programador');
    expect(getLevel(999999).name).toBe('Mestre');
  });
});

describe('vidas (créditos)', () => {
  it('começa com 4 vidas cheias', () => {
    expect(MAX_CREDITS).toBe(4);
    const p = emptyProgress();
    expect(p.credits.current).toBe(4);
    expect(p.credits.max).toBe(4);
    expect(p.credits.nextRechargeAt).toBeNull();
  });

  it('consumir desconta 1 e agenda recarga de 48h', () => {
    const now = 1_000_000;
    const next = consumeCredit(emptyProgress(), now);
    expect(next).not.toBeNull();
    expect(next!.credits.current).toBe(3);
    expect(next!.credits.nextRechargeAt).toBe(now + CREDIT_RECHARGE_MS);
  });

  it('não deixa consumir abaixo de zero', () => {
    let p = emptyProgress();
    for (let i = 0; i < 4; i++) p = consumeCredit(p, 1000)!;
    expect(p.credits.current).toBe(0);
    expect(consumeCredit(p, 1000)).toBeNull();
  });

  it('recarrega tudo após 48h', () => {
    const now = 1_000_000;
    let p = consumeCredit(emptyProgress(), now)!; // 3 vidas, recarga em now+48h
    expect(rechargeCredits(p, now + CREDIT_RECHARGE_MS - 1).credits.current).toBe(3); // ainda não
    p = rechargeCredits(p, now + CREDIT_RECHARGE_MS);
    expect(p.credits.current).toBe(4);
    expect(p.credits.nextRechargeAt).toBeNull();
  });
});

describe('migração de progresso salvo (normalizeProgress)', () => {
  it('migra max antigo 5 -> 4 e clampa o current', () => {
    const p = normalizeProgress({ credits: { current: 5, max: 5, nextRechargeAt: null } });
    expect(p.credits.max).toBe(4);
    expect(p.credits.current).toBe(4);
  });

  it('preenche defaults pra progresso vazio/parcial', () => {
    const p = normalizeProgress({ xp: 30 });
    expect(p.xp).toBe(30);
    expect(p.credits.current).toBe(4);
    expect(Array.isArray(p.xpEvents)).toBe(true);
  });
});

describe('formatCreditTimer', () => {
  it('formata horas e minutos restantes', () => {
    const now = 0;
    expect(formatCreditTimer(48 * 3600_000, now)).toBe('48h 00min');
    expect(formatCreditTimer(90 * 60_000, now)).toBe('1h 30min');
    expect(formatCreditTimer(5 * 60_000, now)).toBe('5min');
    expect(formatCreditTimer(null, now)).toBe('');
  });
});

describe('streak diário (bumpStreak)', () => {
  it('conta dias consecutivos e reseta após gap', () => {
    const today = new Date().toDateString();
    const ontem = new Date(Date.now() - 86400000).toDateString();

    const p = emptyProgress();
    p.streak = { count: 2, lastDate: ontem };
    bumpStreak(p);
    expect(p.streak.count).toBe(3);
    expect(p.streak.lastDate).toBe(today);

    // mesmo dia não soma de novo
    bumpStreak(p);
    expect(p.streak.count).toBe(3);

    const q = emptyProgress();
    q.streak = { count: 9, lastDate: '2000-01-01' };
    bumpStreak(q);
    expect(q.streak.count).toBe(1); // gap -> reinicia
  });
});
