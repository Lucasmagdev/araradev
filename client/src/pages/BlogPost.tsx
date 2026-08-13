import { useParams, Navigate, Link } from 'react-router-dom';
import { getBlogPost } from '../lib/blogContent';
import { renderMarkdown } from '../lib/markdown';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="lp-page">
      <header className="lp-header">
        <div className="lp-header-inner">
          <a href="/" className="lp-brand">
            <img src="/logoararadev.jpeg" className="lp-logo" alt="TrilhaDev" />
            <span className="lp-brand-name">TrilhaDev</span>
          </a>
          <nav className="lp-nav">
            <Link to="/blog" className="lp-btn-ghost">← Blog</Link>
          </nav>
        </div>
      </header>

      <main className="blog-post-page">
        <article className="lp-container blog-post-article">
          <h1>{post.title}</h1>
          <div
            className="blog-post-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.contentMd) }}
          />
          <div className="blog-post-cta">
            <p>Curtiu? A trilha gamificada de fundamentos do TrilhaDev é grátis.</p>
            <a href="/" className="lp-btn-primary lp-btn-lg">Criar conta grátis</a>
          </div>
        </article>
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
    </div>
  );
}
