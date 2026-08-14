// Conteúdo dos posts vem de content/blog/<slug>.json (raiz do repo, fora de
// client/) — mesmo padrão de content/pages/<slug>.json usado pelo site1 do
// Codexy, com o mesmo schema rico de blog usado por site1/doctorchatbot
// (blocks de conteúdo + FAQ, ver generate-blog-trilhadev.mjs). Lido em
// build-time (import.meta.glob eager): zero fetch em runtime.
export interface BlogContentBlock {
  type: "paragraph" | "heading" | "list";
  text?: string;
  items?: string[];
}

export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogPostContent {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content: BlogContentBlock[];
  faq: BlogFaqItem[];
  publishedAt: string;
  seo: { title: string; description: string };
  coverImage?: string;
  coverImageAlt?: string;
  source?: { label: string; url: string };
}

const modules = import.meta.glob<{ default: BlogPostContent }>(
  '../../../content/blog/*.json',
  { eager: true }
);

// Schema mudou ao longo do tempo — um arquivo com formato antigo não pode
// quebrar a listagem inteira, então filtra antes de renderizar.
function isValidPost(post: unknown): post is BlogPostContent {
  const p = post as Partial<BlogPostContent>;
  return typeof p.title === 'string' && typeof p.slug === 'string' && Array.isArray(p.content) && Array.isArray(p.faq);
}

export const BLOG_POSTS: BlogPostContent[] = Object.values(modules)
  .map((m) => m.default)
  .filter(isValidPost)
  .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

export function getBlogPost(slug: string): BlogPostContent | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getOtherPosts(slug: string, limit = 3): BlogPostContent[] {
  return BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, limit);
}

const WORDS_PER_MINUTE = 200;

export function estimateReadingMinutes(post: BlogPostContent): number {
  const words = post.content
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
