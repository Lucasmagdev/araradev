// Conteúdo dos posts vem de content/blog/<slug>.json (raiz do repo, fora de
// client/) — mesmo padrão de content/pages/<slug>.json usado pelo site1 do
// Codexy. Lido em build-time (import.meta.glob eager): zero fetch em
// runtime, o post já sai embutido no bundle/HTML pré-renderizado.
export interface BlogPostContent {
  title: string;
  slug: string;
  excerpt: string;
  contentMd: string;
  publishedAt?: string;
}

const modules = import.meta.glob<{ default: BlogPostContent }>(
  '../../../content/blog/*.json',
  { eager: true }
);

export const BLOG_POSTS: BlogPostContent[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

export function getBlogPost(slug: string): BlogPostContent | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
