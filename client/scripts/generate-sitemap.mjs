#!/usr/bin/env node
// Gera dist/sitemap.xml — nunca existiu (achado em 2026-08-17: robots.txt
// apontava "Sitemap:" pra araradev.netlify.app, domínio errado/placeholder
// nunca trocado, e não tinha nenhum script gerando o arquivo de verdade).
// Sem sitemap, o Google só descobre URL rastreando link — mais lento, mais
// sujeito a perder página nova e a tropeçar em redirect (ex: /blog sem
// barra final → 301 pra /blog/, que o Search Console reportou como "Página
// com redirecionamento" bloqueando indexação).
//
// Mesmo padrão de site1/site2 (scripts/generate-sitemap.tsx nos repos
// codexyti/doctorchatbot_lp): enumera rota estática + conteúdo dinâmico
// (blog, tech-pages) direto dos arquivos JSON em content/, roda depois do
// build (mesma lista de fonte que os scripts de prerender usam).
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const BLOG_CONTENT_DIR = join(__dirname, "..", "..", "content", "blog");
const TECH_CONTENT_DIR = join(__dirname, "..", "..", "content", "tech-pages");
const SITE_URL = "https://trilhadev.app.br";

function listSlugs(dir) {
  try {
    return readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          const data = JSON.parse(readFileSync(join(dir, f), "utf-8"));
          return data.slug || f.replace(/\.json$/, "");
        } catch {
          return f.replace(/\.json$/, "");
        }
      });
  } catch {
    return [];
  }
}

const staticRoutes = [{ path: "/", priority: "1.0" }];

const blogRoutes = [
  { path: "/blog/", priority: "0.7" },
  ...listSlugs(BLOG_CONTENT_DIR).map((slug) => ({ path: `/blog/${slug}/`, priority: "0.8" })),
];

const techRoutes = [
  { path: "/aprenda/", priority: "0.7" },
  ...listSlugs(TECH_CONTENT_DIR).map((slug) => ({ path: `/aprenda/${slug}/`, priority: "0.8" })),
];

const urls = [...staticRoutes, ...blogRoutes, ...techRoutes]
  .map(
    ({ path, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(DIST_DIR, "sitemap.xml"), sitemap, "utf-8");
console.log(
  `[generate-sitemap] gerado dist/sitemap.xml com ${staticRoutes.length + blogRoutes.length + techRoutes.length} URL(s)`
);
