import { Link } from 'react-router-dom';
import { TECH_PAGES } from '../lib/techContent';

export default function TechIndex() {
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
          <h1 className="lp-section-title blog-list-title">Aprenda por tecnologia</h1>
          <p className="lp-section-sub blog-list-sub">
            Por onde começar em cada linguagem e ferramenta — direto ao ponto.
          </p>

          {TECH_PAGES.length === 0 ? (
            <p className="blog-empty">Ainda não tem página publicada. Volta em breve.</p>
          ) : (
            <div className="blog-grid">
              {TECH_PAGES.map((page) => (
                <Link to={`/aprenda/${page.slug}`} className="blog-card" key={page.slug}>
                  <span className="blog-card-category">{page.category}</span>
                  <h2>{page.title}</h2>
                  <p>{page.excerpt}</p>
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
