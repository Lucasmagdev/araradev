#!/usr/bin/env node
// Gera HTML estático por post de blog, igual em espírito a
// prerender-landing.mjs: injeta um snapshot do conteúdo em <div id="root">
// pra crawlers/first-paint (React troca por hidratação client-side depois).
// Mesmo schema rico (blocks + FAQ + categoria + capa) usado por
// site1/doctorchatbot (ver generate-blog-trilhadev.mjs no lado da VPS).
//
// Gera dist/blog/index.html (listagem) e dist/blog/<slug>/index.html (1 por
// post) — cada post com <title>/description/JSON-LD próprios pra SEO de
// verdade. Funciona sem mudar nginx: com "try_files $uri $uri/
// /index.html" (padrão SPA), uma request pra /blog/<slug>/ já resolve pro
// arquivo físico dist/blog/<slug>/index.html se ele existir.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const DIST_INDEX = join(DIST_DIR, 'index.html');
const CONTENT_DIR = join(__dirname, '..', '..', 'content', 'blog');
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

function estimateReadingMinutes(post) {
  const words = post.content
    .map((b) => b.text ?? (b.items ?? []).join(' '))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// Schema mudou ao longo do tempo (versão antiga era markdown solto, sem
// "content"/"faq"). Um arquivo com schema velho não pode derrubar o build
// inteiro — pula com aviso em vez de deixar .map/.filter estourar no meio
// do loop (que travaria ANTES do rsync rodar, via "set -e" no shell script
// que chama isso).
function isValidPost(post) {
  return (
    typeof post.title === 'string' &&
    typeof post.slug === 'string' &&
    Array.isArray(post.content) &&
    Array.isArray(post.faq)
  );
}

function loadPosts() {
  let files = [];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  return files
    .map((f) => ({ f, post: JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8')) }))
    .filter(({ f, post }) => {
      if (isValidPost(post)) return true;
      console.error(`[prerender-blog] pulando ${f}: schema inválido (não bate com o formato atual)`);
      return false;
    })
    .map(({ post }) => post)
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
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

// O template já vem com <div id="root"> preenchido (prerender-landing.mjs
// roda antes e injeta o markup da Landing ali) — por isso não dá pra casar
// "<div id=\"root\"></div>" vazio. O <script type="module"> do bundle final
// fica no <head> (crossorigin), não depois do root como no index.html fonte
// — por isso ancora no </body> em vez do script. Greedy [\s\S]* consome o
// markup da Landing inteiro (com vários </div> aninhados) até o último
// </div> que fecha exatamente antes de </body>.
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

const posts = loadPosts();

let template;
try {
  template = readFileSync(DIST_INDEX, 'utf8');
} catch {
  console.error(`[prerender-blog] não achei ${DIST_INDEX} — roda depois do "vite build".`);
  process.exit(1);
}

// Listagem
const listMarkup = `<div class="lp-page"><main class="blog-list-page"><div class="lp-container">
  <h1 class="lp-section-title blog-list-title">Blog TrilhaDev</h1>
  ${posts.length === 0
    ? '<p class="blog-empty">Ainda não tem post publicado. Volta em breve.</p>'
    : `<div class="blog-grid">${posts.map((p) => `<a class="blog-card" href="/blog/${p.slug}/">${p.coverImage ? `<div class="blog-card-cover"><img src="${p.coverImage}" alt="" /></div>` : ''}<span class="blog-card-category">${esc(p.category ?? '')}</span><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p></a>`).join('')}</div>`}
</div></main></div>`;

const listHtml = withMeta(withRoot(template, listMarkup), {
  title: 'Blog TrilhaDev — programação, fundamentos e carreira dev',
  description: 'Posts sobre lógica de programação, SQL, algoritmos e carreira dev pra quem tá aprendendo do zero.',
  canonical: `${SITE_URL}/blog/`,
});
mkdirSync(join(DIST_DIR, 'blog'), { recursive: true });
writeFileSync(join(DIST_DIR, 'blog', 'index.html'), listHtml);

// Um HTML por post
for (const post of posts) {
  const headings = post.content.filter((b) => b.type === 'heading' && b.text);
  const readingMinutes = estimateReadingMinutes(post);
  const pageUrl = `${SITE_URL}/blog/${post.slug}/`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo?.description ?? post.excerpt,
    datePublished: post.publishedAt,
    url: pageUrl,
    ...(post.coverImage ? { image: `${SITE_URL}${post.coverImage}` } : {}),
    publisher: { '@type': 'Organization', name: 'TrilhaDev' },
  };
  const faqSchema = (post.faq ?? []).length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }
    : null;

  const markup = `<div class="lp-page"><main class="blog-post-page"><div class="lp-container blog-post-grid">
    <article class="blog-post-article">
      <span class="blog-card-category">${esc(post.category ?? '')}</span>
      <h1>${esc(post.title)}</h1>
      <div class="blog-post-meta">
        <span>${new Date(post.publishedAt + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        <span>${readingMinutes} min de leitura</span>
        ${post.source ? `<span>Inspirado em <a href="${esc(post.source.url)}" target="_blank" rel="noopener noreferrer">${esc(post.source.label)}</a></span>` : ''}
      </div>
      ${post.coverImage ? `<div class="blog-post-cover"><img src="${post.coverImage}" alt="${esc(post.coverImageAlt ?? post.title)}" /></div>` : ''}
      <div class="blog-post-body">${post.content.map(renderBlock).join('\n')}</div>
      <div class="blog-post-cta">
        <p>Curtiu? A trilha gamificada de fundamentos do TrilhaDev é grátis.</p>
        <a href="/" class="lp-btn-primary lp-btn-lg">Criar conta grátis</a>
      </div>
      ${post.partner ? `<div class="blog-post-cta"><p>${esc(post.partner.description)}</p><a href="${esc(post.partner.url)}" target="_blank" rel="noopener nofollow sponsored" class="lp-btn-primary lp-btn-lg">Conhecer ${esc(post.partner.name)}</a></div>` : ''}
      ${(post.faq ?? []).length > 0 ? `<div class="blog-post-faq"><h2>Perguntas frequentes</h2>${post.faq.map((item) => `<details><summary>${esc(item.question)}</summary><p>${esc(item.answer)}</p></details>`).join('')}</div>` : ''}
    </article>
    <aside class="blog-post-sidebar">
      ${headings.length > 1 ? `<nav class="blog-post-toc"><div class="blog-post-toc-title">Neste artigo</div><ol>${headings.map((h) => `<li><a href="#${slugifyHeading(h.text)}">${esc(h.text)}</a></li>`).join('')}</ol></nav>` : ''}
    </aside>
  </div></main>${jsonLd(articleSchema)}${faqSchema ? jsonLd(faqSchema) : ''}</div>`;

  const postHtml = withMeta(withRoot(template, markup), {
    title: post.seo?.title ?? `${post.title} — Blog TrilhaDev`,
    description: post.seo?.description ?? post.excerpt,
    canonical: pageUrl,
  });

  const postDir = join(DIST_DIR, 'blog', post.slug);
  mkdirSync(postDir, { recursive: true });
  writeFileSync(join(postDir, 'index.html'), postHtml);
}

console.log(`[prerender-blog] gerado dist/blog/index.html + ${posts.length} post(s) estático(s)`);
