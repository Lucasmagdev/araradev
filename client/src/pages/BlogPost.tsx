import { useParams, Navigate, Link } from 'react-router-dom';
import {
  getBlogPost,
  getOtherPosts,
  estimateReadingMinutes,
  slugifyHeading,
} from '../lib/blogContent';

const SITE_URL = 'https://trilhadev.app.br';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const otherPosts = getOtherPosts(post.slug);
  const headings = post.content.filter((b) => b.type === 'heading' && b.text);
  const readingMinutes = estimateReadingMinutes(post);
  const pageUrl = `${SITE_URL}/blog/${post.slug}/`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.seo.description,
    datePublished: post.publishedAt,
    url: pageUrl,
    ...(post.coverImage && { image: `${SITE_URL}${post.coverImage}` }),
    publisher: { '@type': 'Organization', name: 'TrilhaDev' },
  };

  const faqSchema =
    post.faq.length > 0
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

  return (
    <div className="lp-page">
      <header className="lp-header">
        <div className="lp-header-inner">
          <a href="/" className="lp-brand">
            <img src="/logoararadev.png" className="lp-logo" alt="TrilhaDev" />
            <span className="lp-brand-name">TrilhaDev</span>
          </a>
          <nav className="lp-nav">
            <Link to="/blog" className="lp-btn-ghost">← Blog</Link>
          </nav>
        </div>
      </header>

      <main className="blog-post-page">
        <div className="lp-container blog-post-grid">
          <article className="blog-post-article">
            <span className="blog-card-category">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="blog-post-meta">
              <span>{new Date(post.publishedAt + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span>{readingMinutes} min de leitura</span>
              {post.source && (
                <span>
                  Inspirado em{' '}
                  <a href={post.source.url} target="_blank" rel="noopener noreferrer">
                    {post.source.label}
                  </a>
                </span>
              )}
            </div>

            {post.coverImage && (
              <div className="blog-post-cover">
                <img src={post.coverImage} alt={post.coverImageAlt ?? post.title} />
              </div>
            )}

            <div className="blog-post-body">
              {post.content.map((block, i) => {
                if (block.type === 'heading') {
                  return (
                    <h2 key={i} id={slugifyHeading(block.text ?? '')}>
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === 'list') {
                  return (
                    <ul key={i}>
                      {block.items?.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  );
                }
                return <p key={i}>{block.text}</p>;
              })}
            </div>

            <div className="blog-post-cta">
              <p>Curtiu? A trilha gamificada de fundamentos do TrilhaDev é grátis.</p>
              <a href="/" className="lp-btn-primary lp-btn-lg">Criar conta grátis</a>
            </div>

            {post.partner && (
              <div className="blog-post-cta">
                <p>{post.partner.description}</p>
                <a href={post.partner.url} target="_blank" rel="noopener nofollow sponsored" className="lp-btn-primary lp-btn-lg">
                  Conhecer {post.partner.name}
                </a>
              </div>
            )}

            {post.faq.length > 0 && (
              <div className="blog-post-faq">
                <h2>Perguntas frequentes</h2>
                {post.faq.map((item, i) => (
                  <details key={i}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            )}
          </article>

          <aside className="blog-post-sidebar">
            {headings.length > 1 && (
              <nav className="blog-post-toc" aria-label="Sumário">
                <div className="blog-post-toc-title">Neste artigo</div>
                <ol>
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a href={`#${slugifyHeading(h.text ?? '')}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {otherPosts.length > 0 && (
              <div className="blog-post-related">
                <div className="blog-post-toc-title">Outros posts</div>
                {otherPosts.map((other) => (
                  <a key={other.slug} href={`/blog/${other.slug}/`} className="blog-related-item">
                    {other.title}
                  </a>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <span className="lp-brand">
            <img src="/logoararadev.png" className="lp-logo-sm" alt="" />
            <span>TrilhaDev</span>
          </span>
          <span className="lp-footer-copy">Trilha de fundamentos técnicos</span>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}
    </div>
  );
}
