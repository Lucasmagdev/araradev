#!/usr/bin/env node
// Injeta uma snapshot estática (build-time) do conteúdo da Landing dentro de
// <div id="root"> no dist/index.html gerado pelo vite build. Isso garante
// que crawlers (e qualquer requisição sem JS) recebem o HTML de marketing já
// pronto — incluindo os backlinks pra codexy.com.br e doctorchatbot.com.br —
// em vez de depender do React renderizar no cliente pra esse conteúdo
// aparecer. O React (createRoot, não hydrateRoot) substitui esse markup
// assim que o bundle carrega; não há SSR real nem hidratação — é só uma
// foto do conteúdo pro primeiro paint / indexação.
//
// Mantém os mesmos dados de src/pages/Landing.tsx (PHASE_GROUPS, FEATURES,
// STATS, STEPS, COMPARE, FAQ) duplicados aqui de propósito: importar o
// componente React real puxaria @capacitor/core e outros módulos que tocam
// `window`/`localStorage` no top-level, o que quebra em Node.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_INDEX = join(__dirname, '..', 'dist', 'index.html');

const PHASE_GROUPS = [
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

const COMPARE = [
  { com: 'Cola o erro no chat e copia a resposta', sem: 'Lê o stack trace e entende a causa' },
  { com: 'Pede o código pronto pro prompt', sem: 'Escreve do zero e sabe o porquê' },
  { com: 'Trava sem internet ou sem crédito', sem: 'Resolve sozinho, em qualquer lugar' },
  { com: 'Passa em tutorial, falha na entrevista', sem: 'Explica decisões com segurança' },
];

const FAQ = [
  ['Preciso saber programar pra começar?', 'Não. A trilha começa do absoluto zero — lógica e variáveis — e sobe gradual até React e arquitetura. O onboarding ajusta o ponto de partida ao seu nível.'],
  ['É grátis mesmo? Tem pegadinha?', 'Sim, 100% grátis. As 119 lições e 12 fases são liberadas sem pagar nada. Sem cartão, sem trial.'],
  ['Funciona no celular?', 'Funciona. Roda no navegador e também como app Android. Seu progresso fica salvo na conta e sincroniza entre dispositivos.'],
  ['Quanto tempo leva?', '2–3 lições por dia cobrem a trilha de fundamentos em 3–4 semanas. Sem pressa: o ritmo é seu e o progresso nunca se perde.'],
  ['Por que "sem depender de IA"?', 'A IA é ótima ferramenta, mas colar prompt sem entender trava sua evolução. Aqui você treina a debugar e pensar sozinho — depois usa IA como acelerador, não como muleta.'],
];

const FEATURES = [
  ['Trilha gamificada', 'Cada lição desbloqueada abre a próxima. XP, streak diário e conquistas pra manter o ritmo.'],
  ['Fundamentos reais', 'Lógica, estruturas de dados, SQL, algoritmos, debug, testes e arquitetura. O que o mercado cobra.'],
  ['Progresso salvo', 'Conta própria, progresso vinculado. Continue de qualquer dispositivo, qualquer hora.'],
  ['Ritmo seu', '2–3 lições por dia. Em 3–4 semanas você cobre toda a trilha de fundamentos.'],
];

const STATS = [
  ['119', 'lições'],
  ['12', 'fases'],
  ['100%', 'gratuito'],
  ['0', 'dependência de IA'],
];

const STEPS = [
  ['Responda o onboarding', 'Conta seu objetivo e quanto sabe. A trilha se ajusta ao seu ponto de partida.'],
  ['Siga a trilha', 'Lição a lição, do básico ao avançado. Teoria curta, prática de código e desafios.'],
  ['Resolva sem IA', 'Cada exercício treina você a debugar e pensar sozinho — não a depender de prompt.'],
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const markup = `<div class="lp-page">
  <div class="lp-bg" aria-hidden="true">
    <div class="lp-bg-aurora a1"></div>
    <div class="lp-bg-aurora a2"></div>
    <div class="lp-bg-aurora a3"></div>
    <div class="lp-bg-aurora a4"></div>
  </div>

  <header class="lp-header">
    <div class="lp-header-inner">
      <a href="/" class="lp-brand">
        <img src="/logoararadev.jpeg" class="lp-logo" alt="TrilhaDev" />
        <span class="lp-brand-name">TrilhaDev</span>
      </a>
      <nav class="lp-nav">
        <button class="lp-btn-ghost">Entrar</button>
        <button class="lp-btn-primary">Criar conta</button>
      </nav>
    </div>
  </header>

  <main>
  <section class="lp-hero">
    <div class="lp-hero-inner">
      <div class="lp-badge-row">
        <span class="lp-badge-live"><span class="lp-pulse"></span>Acesso antecipado</span>
        <span class="lp-badge">119 lições · 12 fases · 100% gratuito</span>
      </div>
      <h1 class="lp-headline">
        Aprenda a programar<br />
        <span class="lp-headline-green">de verdade.</span>
      </h1>
      <p class="lp-sub">
        Trilha gamificada do zero aos fundamentos técnicos.
        SQL, algoritmos, debug, testes e arquitetura — sem depender de IA.
      </p>
      <div class="lp-hero-cta">
        <button class="lp-btn-primary lp-btn-lg">Criar conta grátis</button>
        <a href="#fases" class="lp-btn-ghost lp-btn-lg">Ver trilha ↓</a>
      </div>
    </div>
    <div class="lp-hero-visual" aria-hidden="true">
      <div class="lp-phone">
        <div class="lp-phone-screen">
          <div class="lp-mini-top">
            <span class="lp-mini-brand"><img src="/logoararadev.jpeg" alt="" class="lp-mini-logo" /> TrilhaDev</span>
            <span class="lp-mini-xp">480</span>
          </div>
          <div class="lp-mini-fase">FASE 1 · Lógica de programação</div>
          <div class="lp-mini-trail">
            <div class="lp-mini-node done">✓</div>
            <div class="lp-mini-line"></div>
            <div class="lp-mini-node done">✓</div>
            <div class="lp-mini-line"></div>
            <div class="lp-mini-node current">▶</div>
            <div class="lp-mini-label">Loops (for/while)</div>
            <div class="lp-mini-line dim"></div>
            <div class="lp-mini-node lock">🔒</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="lp-stats">
    <div class="lp-container lp-stats-grid">
      ${STATS.map(([n, label]) => `<div class="lp-stat"><span class="lp-stat-n">${esc(n)}</span><span class="lp-stat-l">${esc(label)}</span></div>`).join('\n      ')}
    </div>
  </section>

  <section class="lp-features">
    <div class="lp-container">
      <h2 class="lp-section-title">Tudo pra aprender de verdade</h2>
      <div class="lp-feature-grid">
        ${FEATURES.map(([title, desc]) => `<div class="lp-feature-card"><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="lp-steps">
    <div class="lp-container">
      <h2 class="lp-section-title">Como funciona</h2>
      <div class="lp-steps-grid">
        ${STEPS.map(([title, desc], i) => `<div class="lp-step"><div class="lp-step-num">${i + 1}</div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="lp-compare">
    <div class="lp-container">
      <h2 class="lp-section-title">Programar sem virar refém da IA</h2>
      <p class="lp-section-sub">Prompt resolve a tarefa de hoje. Fundamento resolve sua carreira.</p>
      <div class="lp-compare-grid">
        <div class="lp-compare-col bad">
          <div class="lp-compare-head"><span>Colado na IA</span></div>
          <ul>${COMPARE.map((r) => `<li><span>${esc(r.com)}</span></li>`).join('')}</ul>
        </div>
        <div class="lp-compare-col good">
          <div class="lp-compare-head"><span>Com fundamentos</span></div>
          <ul>${COMPARE.map((r) => `<li><span>${esc(r.sem)}</span></li>`).join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  <section class="lp-preview">
    <div class="lp-container lp-preview-inner">
      <div class="lp-preview-text">
        <h2 class="lp-section-title lp-left">Lição de verdade, não vídeo passivo</h2>
        <p class="lp-section-sub lp-left">Teoria curta, código na tela e desafio pra resolver. Você erra, debuga e aprende — do jeito que fixa.</p>
        <ul class="lp-preview-list">
          <li><span>Explicação direta, sem enrolação</span></li>
          <li><span>Exercício prático a cada lição</span></li>
          <li><span>Feedback na hora, sem precisar de IA</span></li>
        </ul>
      </div>
      <div class="lp-lesson-card" aria-hidden="true">
        <div class="lp-lesson-head">
          <span class="lp-lesson-tag">FASE 1 · LIÇÃO 7</span>
          <span class="lp-lesson-xp">+20 XP</span>
        </div>
        <h3 class="lp-lesson-q">Qual valor <code>soma</code> imprime?</h3>
        <pre class="lp-code"><code>soma = 0
for n in [3, 7, 2]:
    soma += n
print(soma)</code></pre>
        <div class="lp-lesson-opts">
          <span class="lp-opt">10</span>
          <span class="lp-opt correct">12</span>
          <span class="lp-opt">3</span>
          <span class="lp-opt">Erro</span>
        </div>
      </div>
    </div>
  </section>

  <section class="lp-phases" id="fases">
    <div class="lp-container">
      <h2 class="lp-section-title">As 12 fases da trilha</h2>
      ${PHASE_GROUPS.map((group) => `<div class="lp-phase-group tier-${group.tier}">
        <div class="lp-phase-group-head">
          <span class="lp-phase-group-dot"></span>
          <span class="lp-phase-group-label">${esc(group.label)}</span>
          <span class="lp-phase-group-range">${group.phases[0][0]}–${group.phases[group.phases.length - 1][0]}</span>
        </div>
        <div class="lp-phases-grid">
          ${group.phases.map(([num, name]) => `<div class="lp-phase"><span class="lp-phase-num">${num}</span><span class="lp-phase-name">${esc(name)}</span></div>`).join('\n          ')}
        </div>
      </div>`).join('\n      ')}
    </div>
  </section>

  <section class="lp-ecosystem">
    <div class="lp-container">
      <h2 class="lp-section-title">Ecossistema</h2>
      <div class="lp-eco-grid">
        <a class="lp-eco-card" href="https://codexy.com.br/" target="_blank" rel="noopener">
          <div class="lp-eco-icon">🚀</div>
          <h3>Codexy</h3>
          <p>Fábrica de software que constrói o TrilhaDev. Produtos digitais sob medida, do zero à produção.</p>
        </a>
        <a class="lp-eco-card" href="https://doctorchatbot.com.br/" target="_blank" rel="noopener">
          <div class="lp-eco-icon">🩺</div>
          <h3>DoctorChatBot</h3>
          <p>Assistente de IA pra clínicas e consultórios, parceiro do time por trás do TrilhaDev.</p>
        </a>
      </div>
    </div>
  </section>

  <section class="lp-faq">
    <div class="lp-container lp-faq-inner">
      <h2 class="lp-section-title">Perguntas frequentes</h2>
      <div class="lp-faq-list">
        ${FAQ.map(([q, a], i) => `<div class="lp-faq-item${i === 0 ? ' open' : ''}">
          <button class="lp-faq-q" aria-expanded="${i === 0 ? 'true' : 'false'}"><span>${esc(q)}</span></button>
          <div class="lp-faq-a"><p>${esc(a)}</p></div>
        </div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="lp-cta-bottom">
    <div class="lp-container lp-cta-inner">
      <h2>Pronto pra começar?</h2>
      <p>Crie sua conta grátis e inicie a trilha agora.</p>
      <button class="lp-btn-primary lp-btn-lg">Criar conta grátis</button>
    </div>
  </section>
  </main>

  <footer class="lp-footer">
    <div class="lp-container lp-footer-inner">
      <span class="lp-brand">
        <img src="/logoararadev.jpeg" class="lp-logo-sm" alt="" />
        <span>TrilhaDev</span>
      </span>
      <span class="lp-footer-copy">Trilha de fundamentos técnicos</span>
      <span class="lp-footer-copy">Um produto <a href="https://codexy.com.br/" target="_blank" rel="noopener">Codexy</a> · parceiro <a href="https://doctorchatbot.com.br/" target="_blank" rel="noopener">DoctorChatBot</a></span>
    </div>
  </footer>

  <div class="lp-sticky-cta">
    <button class="lp-btn-primary lp-btn-lg">Criar conta grátis</button>
  </div>
</div>`;

let html;
try {
  html = readFileSync(DIST_INDEX, 'utf8');
} catch (e) {
  console.error(`[prerender-landing] não achei ${DIST_INDEX} — roda depois do "vite build".`);
  process.exit(1);
}

if (!html.includes('<div id="root"></div>')) {
  console.error('[prerender-landing] <div id="root"></div> não encontrado em dist/index.html (build mudou?). Abortando sem tocar no arquivo.');
  process.exit(1);
}

html = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
writeFileSync(DIST_INDEX, html);
console.log('[prerender-landing] markup estático injetado em dist/index.html');
