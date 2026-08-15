#!/usr/bin/env node
// Gera HTML estático por página de tecnologia, igual em espírito a
// prerender-blog.mjs: injeta um snapshot do conteúdo em <div id="root">
// pra crawlers/first-paint (React troca por hidratação client-side depois).
//
// Gera dist/aprenda/index.html (listagem) e dist/aprenda/<slug>/index.html
// (1 por tecnologia) — cada um com <title>/description/JSON-LD próprios.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const DIST_INDEX = join(DIST_DIR, 'index.html');
const CONTENT_DIR = join(__dirname, '..', '..', 'content', 'tech-pages');
const SITE_URL = 'https://trilhadev.app.br';
const WORDS_PER_MINUTE = 200;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function slugifyHeading(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function estimateReadingMinutes(page) {
  const words = page.content
    .map((b) => b.text ?? (b.items ?? []).join(' '))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function isValidTechPage(page) {
  return (
    typeof page.title === 'string' &&
    typeof page.slug === 'string' &&
    Array.isArray(page.content) &&
    Array.isArray(page.faq)
  );
}

function loadPages() {
  let files = [];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  return files
    .map((f) => ({ f, page: JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8')) }))
    .filter(({ f, page }) => {
      if (isValidTechPage(page)) return true;
      console.error(`[prerender-tech] pulando ${f}: schema inválido`);
      return false;
    })
    .map(({ page }) => page)
    .sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''));
}

function withMeta(html, { title, description, canonical }) {
  let out = html;
  out = out.replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`);
  out = out.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${esc(description)}" />`);
  out = out.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`);
  out = out.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
  out = out.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(description)}" />`);
  out = out.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`);
  out = out.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  out = out.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(description)}" />`);
  return out;
}

function withRoot(html, markup) {
  const rootRe = /<div id="root">[\s\S]*<\/div>\s*(<\/body>)/;
  if (!rootRe.test(html)) {
    throw new Error('<div id="root">...</div> não encontrado no template — build mudou?');
  }
  return html.replace(rootRe, `<div id="root">${markup}</div>\n  $1`);
}

function renderBlock(block, i) {
  if (block.type === 'heading') {
    return `<h2 id="${slugifyHeading(block.text)}">${esc(block.text)}</h2>`;
  }
  if (block.type === 'list') {
    return `<ul>${(block.items ?? []).map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
  }
  return `<p>${esc(block.text)}</p>`;
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

const pages = loadPages();

let template;
try {
  template = readFileSync(DIST_INDEX, 'utf8');
} catch {
  console.error(`[prerender-tech] não achei ${DIST_INDEX} — roda depois do "vite build".`);
  process.exit(1);
}

// Listagem
const listMarkup = `<div class="lp-page"><main class="blog-list-page"><div class="lp-container">
  <h1 class="lp-section-title blog-list-title">Aprenda por tecnologia</h1>
  ${pages.length === 0
    ? '<p class="blog-empty">Ainda não tem página publicada. Volta em breve.</p>'
    : `<div class="blog-grid">${pages.map((p) => `<a class="blog-card" href="/aprenda/${p.slug}/"><span class="blog-card-category">${esc(p.category ?? '')}</span><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p></a>`).join('')}</div>`}
</div></main></div>`;

const listHtml = withMeta(withRoot(template, listMarkup), {
  title: 'Aprenda por tecnologia — TrilhaDev',
  description: 'Por onde começar em cada linguagem e ferramenta de programação, direto ao ponto.',
  canonical: `${SITE_URL}/aprenda/`,
});
mkdirSync(join(DIST_DIR, 'aprenda'), { recursive: true });
writeFileSync(join(DIST_DIR, 'aprenda', 'index.html'), listHtml);

// Um HTML por página de tecnologia
for (const page of pages) {
  const headings = page.content.filter((b) => b.type === 'heading' && b.text);
  const readingMinutes = estimateReadingMinutes(page);
  const pageUrl = `${SITE_URL}/aprenda/${page.slug}/`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.seo?.description ?? page.excerpt,
    datePublished: page.publishedAt,
    url: pageUrl,
    publisher: { '@type': 'Organization', name: 'TrilhaDev' },
  };
  const faqSchema = (page.faq ?? []).length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  const markup = `<div class="lp-page"><main class="blog-post-page"><div class="lp-container blog-post-grid">
    <article class="blog-post-article">
      <span class="blog-card-category">${esc(page.category ?? '')}</span>
      <h1>${esc(page.title)}</h1>
      <div class="blog-post-meta">
        <span>${new Date(page.publishedAt + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        <span>${readingMinutes} min de leitura</span>
      </div>
      <div class="blog-post-body">${page.content.map(renderBlock).join('\n')}</div>
      <div class="blog-post-cta">
        <p>Curtiu? A trilha gamificada de fundamentos do TrilhaDev é grátis.</p>
        <a href="/" class="lp-btn-primary lp-btn-lg">Criar conta grátis</a>
      </div>
      ${(page.faq ?? []).length > 0 ? `<div class="blog-post-faq"><h2>Perguntas frequentes</h2>${page.faq.map((item) => `<details><summary>${esc(item.question)}</summary><p>${esc(item.answer)}</p></details>`).join('')}</div>` : ''}
    </article>
    <aside class="blog-post-sidebar">
      ${headings.length > 1 ? `<nav class="blog-post-toc"><div class="blog-post-toc-title">Nesta página</div><ol>${headings.map((h) => `<li><a href="#${slugifyHeading(h.text)}">${esc(h.text)}</a></li>`).join('')}</ol></nav>` : ''}
    </aside>
  </div></main>${jsonLd(articleSchema)}${faqSchema ? jsonLd(faqSchema) : ''}</div>`;

  const pageHtml = withMeta(withRoot(template, markup), {
    title: page.seo?.title ?? `${page.title} — TrilhaDev`,
    description: page.seo?.description ?? page.excerpt,
    canonical: pageUrl,
  });

  const pageDir = join(DIST_DIR, 'aprenda', page.slug);
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(join(pageDir, 'index.html'), pageHtml);
}

console.log(`[prerender-tech] gerado dist/aprenda/index.html + ${pages.length} página(s) estática(s)`);
