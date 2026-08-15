// Conteúdo das páginas de tecnologia vem de content/tech-pages/<slug>.json
// (raiz do repo, fora de client/) — mesmo padrão de content/blog/<slug>.json
// (ver blogContent.ts), mesmo schema rico (blocks de conteúdo + FAQ). Lido
// em build-time (import.meta.glob eager): zero fetch em runtime.
export interface TechContentBlock {
  type: "paragraph" | "heading" | "list";
  text?: string;
  items?: string[];
}

export interface TechFaqItem {
  question: string;
  answer: string;
}

export interface TechPageContent {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content: TechContentBlock[];
  faq: TechFaqItem[];
  publishedAt: string;
  seo: { title: string; description: string };
  coverImage?: string;
  coverImageAlt?: string;
}

const modules = import.meta.glob<{ default: TechPageContent }>(
  '../../../content/tech-pages/*.json',
  { eager: true }
);

function isValidTechPage(page: unknown): page is TechPageContent {
  const p = page as Partial<TechPageContent>;
  return typeof p.title === 'string' && typeof p.slug === 'string' && Array.isArray(p.content) && Array.isArray(p.faq);
}

export const TECH_PAGES: TechPageContent[] = Object.values(modules)
  .map((m) => m.default)
  .filter(isValidTechPage)
  .sort((a, b) => a.category.localeCompare(b.category));

export function getTechPage(slug: string): TechPageContent | undefined {
  return TECH_PAGES.find((p) => p.slug === slug);
}

const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(page: TechPageContent): number {
  const words = page.content
    .map((b) => b.text ?? (b.items ?? []).join(' '))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function slugifyHeading(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
