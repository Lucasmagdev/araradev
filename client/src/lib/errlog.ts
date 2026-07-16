import { API_BASE } from './api';

// Reporta erros JS não tratados pro backend (/api/client-errors), pra bug em
// produção (celular de usuário) ficar visível no admin. Dedup por mensagem na
// sessão + teto de envios pra nunca virar loop de spam.

const sent = new Set<string>();
let budget = 10; // máximo por sessão

function report(message: string, stack?: string) {
  if (budget <= 0) return;
  const key = message.slice(0, 200);
  if (sent.has(key)) return;
  sent.add(key);
  budget--;
  try {
    void fetch(API_BASE + '/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.slice(0, 500),
        stack: stack?.slice(0, 4000),
        url: location.href.slice(0, 300),
      }),
      // sem credentials: reporte é anônimo se a sessão não estiver no cookie
      keepalive: true,
    }).catch(() => {});
  } catch { /* nunca deixar o logger derrubar o app */ }
}

export function initErrorReporting() {
  window.addEventListener('error', (e) => {
    report(e.message || 'Erro desconhecido', e.error?.stack);
  });
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    if (reason instanceof Error) report(reason.message, reason.stack);
    else report(typeof reason === 'string' ? reason : JSON.stringify(reason)?.slice(0, 500) || 'Promise rejeitada');
  });
}
