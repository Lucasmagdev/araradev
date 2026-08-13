import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../lib/blogContent';

export default function Blog() {
  return (
    <div className="lp-page">
      <header className="lp-header">
        <div className="lp-header-inner">
          <a href="/" className="lp-brand">
            <img src="/logoararadev.jpeg" className="lp-logo" alt="TrilhaDev" />
            <span className="lp-brand-name">TrilhaDev</span>
          </a>
          <nav className="lp-nav">
            <a href="/" className="lp-btn-ghost">Voltar ao início</a>
          </nav>
        </div>
      </header>

      <main className="blog-list-page">
        <div className="lp-container">
          <h1 className="lp-section-title blog-list-title">Blog TrilhaDev</h1>
          <p className="lp-section-sub blog-list-sub">
            Programação, fundamentos e carreira dev — direto ao ponto.
          </p>

          {BLOG_POSTS.length === 0 ? (
            <p className="blog-empty">Ainda não tem post publicado. Volta em breve.</p>
          ) : (
            <div className="blog-grid">
              {BLOG_POSTS.map((post) => (
                <Link to={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
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
    </div>
  );
}
