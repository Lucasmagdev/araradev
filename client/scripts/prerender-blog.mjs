#!/usr/bin/env node
// Gera HTML estático por post de blog, igual em espírito a
// prerender-landing.mjs: injeta um snapshot do conteúdo em <div id="root">
// pra crawlers/first-paint (React troca por hidratação client-side depois).
//
// Diferença: aqui não é 1 arquivo (dist/index.html), são N arquivos —
// dist/blog/index.html (listagem) e dist/blog/<slug>/index.html (1 por
// post) — porque cada post precisa de <title>/description próprios pra SEO
// de verdade. Funciona sem mudar nginx: com "try_files $uri $uri/
// /index.html" (padrão SPA), uma request pra /blog/<slug>/ já resolve pro
// arquivo físico dist/blog/<slug>/index.html se ele existir.
//
// Conversor markdown->HTML é uma cópia minimalista do de
// src/lib/markdown.ts (mesmo motivo de duplicar dados do prerender-landing:
// esse script roda com node puro, sem TS/bundler).

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const DIST_INDEX = join(DIST_DIR, 'index.html');
const CONTENT_DIR = join(__dirname, '..', '..', 'content', 'blog');
const SITE_URL = 'https://trilhadev.app.br';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

function renderMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let listBuffer = [];
  const flushList = () => {
    if (listBuffer.length === 0) return;
    html.push(`<ul>${listBuffer.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
    listBuffer = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      html.push(`<h${level + 1}>${inline(heading[2])}</h${level + 1}>`);
      continue;
    }
    const listItem = line.match(/^[-*]\s+(.*)$/);
    if (listItem) { listBuffer.push(listItem[1]); continue; }
    flushList();
    html.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  return html.join('\n');
}

function loadPosts() {
  let files = [];
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  return files
    .map((f) => JSON.parse(readFileSync(join(CONTENT_DIR, f), 'utf8')))
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
    : `<div class="blog-grid">${posts.map((p) => `<a class="blog-card" href="/blog/${p.slug}/"><h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p></a>`).join('')}</div>`}
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
  const markup = `<div class="lp-page"><main class="blog-post-page"><article class="lp-container blog-post-article">
    <h1>${esc(post.title)}</h1>
    <div class="blog-post-body">${renderMarkdown(post.contentMd)}</div>
  </article></main></div>`;

  const postHtml = withMeta(withRoot(template, markup), {
    title: `${post.title} — Blog TrilhaDev`,
    description: post.excerpt,
    canonical: `${SITE_URL}/blog/${post.slug}/`,
  });

  const postDir = join(DIST_DIR, 'blog', post.slug);
  mkdirSync(postDir, { recursive: true });
  writeFileSync(join(postDir, 'index.html'), postHtml);
}

console.log(`[prerender-blog] gerado dist/blog/index.html + ${posts.length} post(s) estático(s)`);
