import { useParams, Navigate, Link } from 'react-router-dom';
import {
  getTechPage,
  estimateReadingMinutes,
  slugifyHeading,
} from '../lib/techContent';

const SITE_URL = 'https://trilhadev.app.br';

export default function TechPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getTechPage(slug) : undefined;

  if (!page) return <Navigate to="/aprenda" replace />;

  const headings = page.content.filter((b) => b.type === 'heading' && b.text);
  const readingMinutes = estimateReadingMinutes(page);
  const pageUrl = `${SITE_URL}/aprenda/${page.slug}/`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.seo.description,
    datePublished: page.publishedAt,
    url: pageUrl,
    publisher: { '@type': 'Organization', name: 'TrilhaDev' },
  };

  const faqSchema =
    page.faq.length > 0
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

  return (
    <div className="lp-page">
      <header className="lp-header">
        <div className="lp-header-inner">
          <a href="/" className="lp-brand">
            <img src="/logoararadev.jpeg" className="lp-logo" alt="TrilhaDev" />
            <span className="lp-brand-name">TrilhaDev</span>
          </a>
          <nav className="lp-nav">
            <Link to="/aprenda" className="lp-btn-ghost">← Aprenda por tecnologia</Link>
          </nav>
        </div>
      </header>

      <main className="blog-post-page">
        <div className="lp-container blog-post-grid">
          <article className="blog-post-article">
            <span className="blog-card-category">{page.category}</span>
            <h1>{page.title}</h1>
            <div className="blog-post-meta">
              <span>{new Date(page.publishedAt + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <span>{readingMinutes} min de leitura</span>
            </div>

            <div className="blog-post-body">
              {page.content.map((block, i) => {
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

            {page.partner && (
              <div className="blog-post-cta">
                <p>{page.partner.description}</p>
                <a href={page.partner.url} target="_blank" rel="noopener nofollow sponsored" className="lp-btn-primary lp-btn-lg">
                  Conhecer {page.partner.name}
                </a>
              </div>
            )}

            {page.faq.length > 0 && (
              <div className="blog-post-faq">
                <h2>Perguntas frequentes</h2>
                {page.faq.map((item, i) => (
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
                <div className="blog-post-toc-title">Nesta página</div>
                <ol>
                  {headings.map((h, i) => (
                    <li key={i}>
                      <a href={`#${slugifyHeading(h.text ?? '')}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </aside>
        </div>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <span className="lp-brand">
            <img src="/logoararadev.jpeg" className="lp-logo-sm" alt="" />
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
