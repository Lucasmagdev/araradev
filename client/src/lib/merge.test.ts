import { describe, it, expect } from 'vitest';
import { emptyProgress, mergeProgress } from './progress';
import type { Progress } from '../types';

function withData(partial: Partial<Progress>): Progress {
  return { ...emptyProgress(), ...partial };
}

describe('mergeProgress (sync local × remoto)', () => {
  it('lição feita offline não some quando o remoto chega desatualizado', () => {
    const local = withData({
      completed: { 'a': true, 'b': true, 'offline-1': true },
      xp: 45,
    });
    const remote = withData({ completed: { 'a': true, 'b': true }, xp: 35 });

    const merged = mergeProgress(local, remote);
    expect(merged.completed['offline-1']).toBe(true);
    expect(merged.xp).toBe(45);
  });

  it('remoto com mais progresso (outro dispositivo) vence onde é maior', () => {
    const local = withData({ completed: { 'a': true }, xp: 10 });
    const remote = withData({ completed: { 'a': true, 'b': true, 'c': true }, xp: 80 });

    const merged = mergeProgress(local, remote);
    expect(Object.keys(merged.completed).sort()).toEqual(['a', 'b', 'c']);
    expect(merged.xp).toBe(80);
  });

  it('badges são a união dos dois lados', () => {
    const local = withData({ badges: ['first-lesson', 'xp-50'] });
    const remote = withData({ badges: ['first-lesson', 'streak-3'] });

    const merged = mergeProgress(local, remote);
    expect(merged.badges.sort()).toEqual(['first-lesson', 'streak-3', 'xp-50']);
  });

  it('streak mais recente ganha; mesma data pega a maior contagem', () => {
    const hoje = new Date().toDateString();
    const ontem = new Date(Date.now() - 86400000).toDateString();

    const local = withData({ streak: { count: 2, lastDate: hoje } });
    const remoteVelho = withData({ streak: { count: 9, lastDate: ontem } });
    expect(mergeProgress(local, remoteVelho).streak).toEqual({ count: 2, lastDate: hoje });

    const remoteMesmoDia = withData({ streak: { count: 5, lastDate: hoje } });
    expect(mergeProgress(local, remoteMesmoDia).streak).toEqual({ count: 5, lastDate: hoje });
  });

  it('créditos: o menor valor vence (não farma vida trocando de dispositivo)', () => {
    // recarga agendada no futuro — senão normalizeProgress recarrega e o teste não testa o merge
    const local = withData({ credits: { current: 1, max: 4, nextRechargeAt: Date.now() + 3600000 } });
    const remote = withData({ credits: { current: 4, max: 4, nextRechargeAt: null } });

    expect(mergeProgress(local, remote).credits.current).toBe(1);
    expect(mergeProgress(remote, local).credits.current).toBe(1);
  });

  it('xpEvents não duplica evento presente nos dois lados', () => {
    const ev = { amount: 10, source: 'lesson:a', at: 1000 };
    const local = withData({ xpEvents: [ev, { amount: 5, source: 'lesson:b', at: 2000 }] });
    const remote = withData({ xpEvents: [ev] });

    const merged = mergeProgress(local, remote);
    expect(merged.xpEvents).toHaveLength(2);
  });

  it('daily challenge: data mais recente ganha; mesma data soma o melhor resultado', () => {
    const local = withData({ dailyChallenge: { date: '2026-07-15', completed: true, correct: 3, total: 5 } });
    const remote = withData({ dailyChallenge: { date: '2026-07-14', completed: true, correct: 5, total: 5 } });
    expect(mergeProgress(local, remote).dailyChallenge.date).toBe('2026-07-15');

    const remoteMesmoDia = withData({ dailyChallenge: { date: '2026-07-15', completed: false, correct: 4, total: 5 } });
    const merged = mergeProgress(local, remoteMesmoDia);
    expect(merged.dailyChallenge.completed).toBe(true);
    expect(merged.dailyChallenge.correct).toBe(4);
  });

  it('código salvo local (edição mais recente do dispositivo) sobrepõe o remoto', () => {
    const local = withData({ code: { 'lesson-x': 'versao local' } });
    const remote = withData({ code: { 'lesson-x': 'versao remota', 'lesson-y': 'so remoto' } });

    const merged = mergeProgress(local, remote);
    expect(merged.code['lesson-x']).toBe('versao local');
    expect(merged.code['lesson-y']).toBe('so remoto');
  });

  it('merge com remoto vazio devolve o local; com local vazio devolve o remoto', () => {
    const cheio = withData({ completed: { a: true }, xp: 30, badges: ['first-lesson'] });
    const vazio = emptyProgress();

    expect(mergeProgress(cheio, vazio).completed['a']).toBe(true);
    expect(mergeProgress(vazio, cheio).completed['a']).toBe(true);
    expect(mergeProgress(vazio, cheio).xp).toBe(30);
  });
});
