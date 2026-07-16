import { describe, it, expect, beforeEach, vi } from 'vitest';
import { emptyProgress } from './progress';
import { flushPending, recordLessonCompletion, saveProgressRemote } from './api';

const QUEUE_KEY = 'pc_sync_queue_v1';

// localStorage em memória (vitest roda em ambiente node, sem DOM)
function makeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => store.clear(),
  };
}

function readQueue(): { path: string; body: unknown }[] {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
}

const netFail = () => Promise.reject(new TypeError('Failed to fetch'));
const ok = () => Promise.resolve({ ok: true, json: async () => ({ ok: true }) } as Response);
const badRequest = () => Promise.resolve({ ok: false, status: 400, json: async () => ({ error: 'inválido' }) } as Response);

describe('fila offline (postOrQueue + flushPending)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeStorage());
  });

  it('falha de rede enfileira a escrita', async () => {
    vi.stubGlobal('fetch', vi.fn(netFail));
    await recordLessonCompletion('logic-1', 10);
    expect(readQueue()).toHaveLength(1);
    expect(readQueue()[0].path).toBe('/api/lesson-completions');
  });

  it('erro 4xx NÃO enfileira (reenviar não resolve)', async () => {
    vi.stubGlobal('fetch', vi.fn(badRequest));
    await recordLessonCompletion('logic-1', 10);
    expect(readQueue()).toHaveLength(0);
  });

  it('snapshot de progresso: só o mais recente fica na fila', async () => {
    vi.stubGlobal('fetch', vi.fn(netFail));
    const p1 = { ...emptyProgress(), xp: 10 };
    const p2 = { ...emptyProgress(), xp: 20 };
    await saveProgressRemote(p1);
    await saveProgressRemote(p2);

    const queue = readQueue();
    const snapshots = queue.filter(op => op.path === '/api/progress');
    expect(snapshots).toHaveLength(1);
    expect((snapshots[0].body as { xp: number }).xp).toBe(20);
  });

  it('flushPending reenvia tudo quando a rede volta', async () => {
    vi.stubGlobal('fetch', vi.fn(netFail));
    await recordLessonCompletion('logic-1', 10);
    await recordLessonCompletion('logic-2', 10);
    expect(readQueue()).toHaveLength(2);

    const sent = vi.fn(ok);
    vi.stubGlobal('fetch', sent);
    await flushPending();
    expect(readQueue()).toHaveLength(0);
    expect(sent).toHaveBeenCalledTimes(2);
  });

  it('flushPending para na primeira falha de rede e preserva a fila', async () => {
    vi.stubGlobal('fetch', vi.fn(netFail));
    await recordLessonCompletion('logic-1', 10);
    await recordLessonCompletion('logic-2', 10);

    await flushPending(); // ainda sem rede
    expect(readQueue()).toHaveLength(2);
  });

  it('flushPending descarta op rejeitada pelo servidor (4xx) sem travar a fila', async () => {
    vi.stubGlobal('fetch', vi.fn(netFail));
    await recordLessonCompletion('logic-1', 10);
    await recordLessonCompletion('logic-2', 10);

    const responses = [badRequest(), ok()];
    vi.stubGlobal('fetch', vi.fn(() => responses.shift()!));
    await flushPending();
    expect(readQueue()).toHaveLength(0);
  });
});
