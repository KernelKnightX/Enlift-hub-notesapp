import { useMemo, useState } from 'react';
import Link from 'next/link';
import useFirestoreCollection from '@/hooks/useFirestoreCollection';
import {
  Search, BookOpen, Filter, Star, Download,
  ChevronRight, ArrowRight, ChevronDown
} from 'lucide-react';

const FILTER_CHIPS = [
  'UPSC Prelims', 'UPSC Mains', 'NCERT', 'Optional Subjects', 'Current Affairs', 'Latest Additions',
];

const CAT_COLORS = ['violet', 'blue', 'green', 'amber', 'pink', 'cyan', 'orange', 'lime'];
const colorFor = (index) => CAT_COLORS[index % CAT_COLORS.length];

const READING_PATH = [
  { step: 'NCERT', note: 'Build basic concepts first, class 6 through 12.' },
  { step: 'Standard Books', note: 'Go deep with subject-authority texts.' },
  { step: 'Current Affairs', note: 'Layer in daily and monthly compilations.' },
  { step: 'Revision', note: 'Condense everything into your own short notes.' },
  { step: 'Mock Tests', note: 'Simulate exam conditions and time pressure.' },
];

const FAQS = [
  {
    q: 'Which books are best for UPSC?',
    a: 'Start with NCERTs for basic concepts, then move to standard texts like Laxmikanth for Polity, Ramesh Singh for Economy and GC Leong for Geography.',
  },
  {
    q: 'Are NCERT books enough?',
    a: 'NCERTs are essential for foundational clarity, but they are typically not sufficient alone for UPSC. Use them alongside standard books and consistent current affairs practice.',
  },
  {
    q: 'Which books are useful for beginners?',
    a: 'Begin with NCERTs, followed by introductory texts such as Laxmikanth, Spectrum Optional summaries and short compilations for current affairs.',
  },
  {
    q: 'How should I prepare for Prelims?',
    a: 'Combine an MCQ-focused book with regular revision, current affairs notes and repeated practice tests to build speed and accuracy.',
  },
  {
    q: 'How should I prepare for Mains?',
    a: 'Focus on answer writing, synoptic thinking and structured note-making. Use standard books alongside previous year papers and model answers.',
  },
];

// Library-catalog style call number, e.g. "POL·014"
function callNumber(subject, index) {
  const code = (subject || 'GEN').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'GEN';
  return `${code}·${String(index + 1).padStart(3, '0')}`;
}

function CategoryCard({ category, index }) {
  const color = colorFor(index);
  return (
    <article className="category-card card card-hover">
      <div className={`category-icon chip-${color}`}>{category.name.slice(0, 2)}</div>
      <div className="category-card__body">
        <h3>{category.name}</h3>
        <p>{category.description}</p>
      </div>
      <span className="category-count">{category.count} books</span>
    </article>
  );
}

function BookCard({ book, index }) {
  return (
    <article className="book-card card card-hover">
      <div className="book-card__cover">
        <span className="book-card__initials">
          {book.title.split(' ').slice(0, 2).map(word => word[0]).join('')}
        </span>
        <span className="book-card__callnum">{callNumber(book.subject, index)}</span>
      </div>
      <div className="book-card__content">
        <div className="book-card__top">
          <span className="book-card__badge">{book.subject}</span>
          <div className="book-card__tags">
            {book.tags.map((tag, i) => (
              <span key={tag} className={`chip chip-${colorFor(i + index)}`}>{tag}</span>
            ))}
          </div>
        </div>
        <h3>{book.title}</h3>
        <p className="book-card__meta">
          {book.language}
          {book.difficulty ? ` · ${book.difficulty}` : ''}
          {book.pages ? ` · ${book.pages} pages` : ''}
        </p>
        <p className="book-card__description">{book.description}</p>
        <div className="book-card__footer">
          <div className="book-card__stats">
            <span><Star size={14} /> {book.rating}</span>
            <span><Download size={14} /> {book.downloads}</span>
          </div>
          <button className={`btn ${book.status === 'Coming Soon' ? 'btn-ghost' : 'btn-primary'}`}>
            {book.status}
          </button>
        </div>
      </div>
    </article>
  );
}

function AuthorCard({ name, subtitle, index }) {
  const color = colorFor(index);
  return (
    <div className="author-card card card-hover">
      <div className={`author-avatar chip-${color}`}>{(name || '').split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
      <div>
        <h4>{name}</h4>
        <p>{subtitle || 'Trusted UPSC subject area'}</p>
      </div>
    </div>
  );
}

function CollectionCard({ title }) {
  return (
    <div className="collection-card card card-hover">
      <div>
        <span className="collection-card__eyebrow">Collection</span>
        <h4>{title}</h4>
        <p>Curated for fast reading and exam relevance.</p>
      </div>
      <ChevronRight size={18} />
    </div>
  );
}

export default function BooksResourcePage() {
  const [activeChip, setActiveChip] = useState('UPSC Prelims');
  const [searchValue, setSearchValue] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const { data: subjectDocs = [] } = useFirestoreCollection({
    name: 'pdfSubjects',
    orderBy: ['order', 'asc'],
    fallback: [],
  });

  const { data: pdfDocs = [] } = useFirestoreCollection({
    name: 'pdfs',
    orderBy: ['createdAt', 'desc'],
    fallback: [],
  });

  const categories = useMemo(() => subjectDocs.map((subject, index) => ({
    name: subject.name || 'General',
    count: subject.pdfCount || 0,
    description: subject.description || `Study material for ${subject.name || 'UPSC'}.`,
    id: subject.id,
    colorIndex: index,
  })), [subjectDocs]);

  const makeRating = (index) => Number((4.6 + (index % 4) * 0.1).toFixed(1));
  const makeDownloads = (index) => `${Math.max(40, 1200 - index * 80)}+`;

  const books = useMemo(() => pdfDocs.map((pdf, index) => {
    const subject = subjectDocs.find((s) => s.id === pdf.subjectId);
    return {
      id: pdf.id,
      title: pdf.title || pdf.name || 'Untitled',
      subject: subject?.name || pdf.subjectId || 'General',
      description: pdf.description || pdf.title || 'Study material for UPSC.',
      pages: pdf.pages || null,
      language: pdf.language || 'English',
      difficulty: pdf.difficulty || 'Intermediate',
      tags: [subject?.name || 'General', pdf.pages ? `${pdf.pages} pages` : 'PDF'],
      rating: makeRating(index),
      downloads: makeDownloads(index),
      status: 'Download PDF',
      url: pdf.url || pdf.fullPath || '#',
    };
  }), [pdfDocs, subjectDocs]);

  const filteredBooks = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch = !query || [book.title, book.subject, book.description].some((field) => field.toLowerCase().includes(query));
      const matchesChip = !activeChip || activeChip === 'Latest Additions'
        ? true
        : book.tags.some((tag) => tag.toLowerCase().includes(activeChip.toLowerCase()))
          || book.subject.toLowerCase().includes(activeChip.toLowerCase())
          || book.title.toLowerCase().includes(activeChip.toLowerCase());
      return matchesSearch && matchesChip;
    });
  }, [books, searchValue, activeChip]);

  const featuredBooks = useMemo(() => filteredBooks.slice(0, 6), [filteredBooks]);
  const recentBooks = useMemo(() => books.slice(0, 4), [books]);
  const popularSubjects = useMemo(() => subjectDocs.slice(0, 10), [subjectDocs]);
  const collectionTitles = useMemo(() => subjectDocs.slice(0, 8).map((subject) => `${subject.name} Essentials`), [subjectDocs]);
  const mostDownloaded = useMemo(() => books.slice(0, 4), [books]);
  const subjectFilters = useMemo(() => subjectDocs.map((subject) => subject.name).slice(0, 8), [subjectDocs]);
  const languageOptions = useMemo(() => Array.from(new Set(books.map((book) => book.language))).filter(Boolean), [books]);
  const difficultyOptions = useMemo(() => Array.from(new Set(books.map((book) => book.difficulty))).filter(Boolean), [books]);

  return (
    <main className="books-page">
      <section className="hero-section">
        <div className="page-inner hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Reading list · updated regularly</span>
            <h1 className="hero-display">Best UPSC Books &amp; Study Materials</h1>
            <p>A working library for UPSC Prelims and Mains — organised by subject, with a recommended reading order and the latest additions surfaced first.</p>
            <div className="search-bar">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search by title, author or subject"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                aria-label="Search books"
              />
            </div>
            <div className="filter-chips">
              {FILTER_CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  className={`chip ${activeChip === chip ? 'chip-primary' : 'chip-ghost'}`}
                  onClick={() => setActiveChip(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
          <div className="hero-visual card card-hover">
            <div className="hero-visual__header">
              <BookOpen size={20} />
              <span>Library snapshot</span>
            </div>
            <div className="hero-visual__metrics">
              <div>
                <strong>18k+</strong>
                <span>Downloads</span>
              </div>
              <div>
                <strong>{categories.length || 24}</strong>
                <span>Categories</span>
              </div>
              <div>
                <strong>{books.length || 300}+</strong>
                <span>Books catalogued</span>
              </div>
            </div>
            <p className="hero-visual__note">Every title is filed by subject and call number, the same way it would sit on a shelf.</p>
          </div>
        </div>
      </section>

      <section className="page-inner section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Browse by category</span>
            <h2>Find the right book for every UPSC topic</h2>
          </div>
          <Link href="#featured" className="text-link">See featured books <ArrowRight size={16} /></Link>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <CategoryCard key={category.id || category.name} category={category} index={index} />
          ))}
        </div>
      </section>

      <section className="page-inner section featured-section" id="featured">
        <div className="featured-layout">
          <div className="featured-main">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Featured books</span>
                <h2>Premium UPSC titles ready for download</h2>
              </div>
              <button type="button" className="btn btn-outline">
                <Filter size={16} /> Filter options
              </button>
            </div>
            <div className="book-grid">
              {featuredBooks.length > 0 ? featuredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              )) : (
                <div className="empty-state card">No books match your search yet. Try a different keyword or filter.</div>
              )}
            </div>
          </div>

          <aside className="featured-aside sticky-panel">
            <div className="filter-panel card">
              <div className="panel-title">
                <h3>Filter library</h3>
                <span>Refine results for your study plan.</span>
              </div>
              <div className="filter-group">
                <h4>Subject</h4>
                {subjectFilters.map((item) => (
                  <label key={item} className="filter-option">
                    <input type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <h4>Language</h4>
                {languageOptions.map((item) => (
                  <label key={item} className="filter-option">
                    <input type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <h4>Difficulty</h4>
                {difficultyOptions.map((item) => (
                  <label key={item} className="filter-option">
                    <input type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
              <div className="filter-group">
                <h4>Status</h4>
                {['Latest', 'Popular', 'Free', 'Premium'].map(item => (
                  <label key={item} className="filter-option">
                    <input type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="page-inner section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Popular subjects</span>
            <h2>Topics aspirants access most frequently</h2>
          </div>
        </div>
        <div className="authors-grid">
          {popularSubjects.map((subject, index) => (
            <AuthorCard
              key={subject.id}
              name={subject.name}
              subtitle={`${subject.pdfCount || 0} PDFs`}
              index={index}
            />
          ))}
        </div>
      </section>

      <section className="page-inner section path-section">
        <div className="path-card card card-hover">
          <div className="path-card__intro">
            <span className="eyebrow">Recommended path</span>
            <h2>A beginner-friendly study order</h2>
            <p>Follow this sequence once — each stage sets up the next.</p>
          </div>
          <ol className="path-steps">
            {READING_PATH.map((item, index) => (
              <li key={item.step} className="path-step">
                <span className="step-index">{index + 1}</span>
                <div>
                  <h4>{item.step}</h4>
                  <p>{item.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-inner section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Collections</span>
            <h2>Dynamic bundles built from your subject library</h2>
          </div>
        </div>
        <div className="collections-grid">
          {collectionTitles.map(title => <CollectionCard key={title} title={title} />)}
        </div>
      </section>

      <section className="page-inner section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Recently added</span>
            <h2>New arrivals for fast-moving topics</h2>
          </div>
        </div>
        <div className="carousel-row">
          {recentBooks.map((book) => (
            <div key={book.id} className="recent-card card card-hover">
              <span className="recent-badge chip chip-primary">Latest</span>
              <h3>{book.title}</h3>
              <p>{book.subject}</p>
              <button className="recent-actions" onClick={() => window.open(book.url, '_blank')}>
                Preview <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="page-inner section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Most downloaded</span>
            <h2>Books aspirants open again and again</h2>
          </div>
        </div>
        <div className="download-grid">
          {mostDownloaded.map((book, index) => (
            <div key={book.id} className="download-card card card-hover">
              <div className="download-card__meta">
                <span className={`chip chip-${colorFor(index)}`}>{book.subject}</span>
                <span className="download-title">{book.title}</span>
              </div>
              <p>{book.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-inner section faq-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2>Questions every UPSC reader asks</h2>
          </div>
        </div>
        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const open = openFaq === index;
            return (
              <div key={faq.q} className="faq-item card">
                <button type="button" className="faq-question" onClick={() => setOpenFaq(open ? null : index)} aria-expanded={open}>
                  <h3>{faq.q}</h3>
                  <ChevronDown
                    size={18}
                    className={`faq-chevron ${open ? 'is-open' : ''}`}
                  />
                </button>
                {open && <p className="faq-answer">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="newsletter-section">
        <div className="page-inner newsletter-card card grad-hero">
          <div>
            <span className="eyebrow eyebrow-inverse">Stay updated</span>
            <h2>Get alerts when new UPSC books are added</h2>
            <p>Save time and never miss the latest essential downloads for Prelims and Mains.</p>
          </div>
          <form className="newsletter-cta" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" aria-label="Newsletter email" />
            <button type="submit" className="btn btn-dark">Notify me</button>
          </form>
        </div>
      </section>

      <style jsx>{`
        :global(:root) {
          --font-display: Georgia, 'Source Serif 4', 'Iowan Old Style', serif;
          --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .books-page { background: var(--color-bg); color: var(--color-ink); }
        .page-inner { max-width: 1240px; margin: 0 auto; padding: 0 1.5rem; }

        /* ---- shared rhythm ---- */
        .section { padding-top: 3.25rem; padding-bottom: 3.25rem; }
        .section-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1.5rem; }
        .section-heading h2 { font-family: var(--font-display); font-size: clamp(1.5rem, 2.1vw, 2rem); line-height: 1.25; margin: 0.3rem 0 0; max-width: 34ch; }
        .eyebrow { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--color-primary); }
        .text-link { color: var(--color-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem; white-space: nowrap; }

        /* ---- hero ---- */
        .hero-section { padding: 3.5rem 0 2.5rem; border-bottom: 1px solid var(--color-border); }
        .hero-grid { display: grid; gap: 1.75rem; }
        .hero-copy { max-width: 640px; }
        .hero-copy .eyebrow { display: inline-flex; margin-bottom: 0.9rem; }
        .hero-display { font-family: var(--font-display); font-weight: 600; font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.1; margin: 0 0 1rem; letter-spacing: -0.01em; }
        .hero-copy p { color: var(--color-ink-muted); max-width: 56ch; line-height: 1.7; margin: 0 0 1.5rem; }
        .search-bar { display: flex; align-items: center; gap: 0.75rem; background: var(--color-surface); border: 1px solid var(--color-border-strong); border-radius: 0.6rem; padding: 0.8rem 1.1rem; color: var(--color-ink-faint); }
        .search-bar input { width: 100%; border: none; outline: none; font-size: 0.98rem; color: var(--color-ink); background: transparent; }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1.1rem; }

        .hero-visual { padding: 1.5rem; display: grid; gap: 1.1rem; align-content: start; background: var(--color-primary-tint); border: 1px solid var(--color-border); }
        .hero-visual__header { display: inline-flex; align-items: center; gap: 0.6rem; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-primary); }
        .hero-visual__metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
        .hero-visual__metrics div { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 0.5rem; padding: 0.85rem 0.6rem; text-align: center; }
        .hero-visual__metrics strong { display: block; font-family: var(--font-display); font-size: 1.35rem; margin-bottom: 0.2rem; color: var(--color-primary); }
        .hero-visual__metrics span { color: var(--color-ink-muted); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .hero-visual__note { margin: 0; font-size: 0.85rem; color: var(--color-ink-muted); line-height: 1.6; }

        /* ---- category cards ---- */
        .categories-grid { display: grid; grid-template-columns: 1fr; gap: 0.85rem; }
        .category-card { padding: 1.1rem; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.9rem; }
        .category-icon { width: 2.6rem; height: 2.6rem; border-radius: 0.6rem; display: grid; place-items: center; font-family: var(--font-mono); font-weight: 700; font-size: 0.9rem; padding: 0; }
        .category-card h3 { margin: 0; font-size: 1rem; }
        .category-card p { margin: 0.3rem 0 0; color: var(--color-ink-muted); line-height: 1.55; font-size: 0.88rem; }
        .category-count { font-family: var(--font-mono); color: var(--color-primary); font-size: 0.78rem; font-weight: 700; white-space: nowrap; }

        /* ---- featured layout ---- */
        .featured-layout { display: grid; grid-template-columns: 1fr; gap: 2rem; }
        .btn-outline { border: 1px solid var(--color-border-strong); color: var(--color-primary); background: var(--color-surface); display: inline-flex; align-items: center; gap: 0.5rem; }
        .btn-outline:hover { background: var(--color-primary-tint); border-color: var(--color-primary); }

        .book-grid { display: grid; grid-template-columns: 1fr; gap: 0.85rem; }
        .book-card { display: flex; gap: 1rem; padding: 1.1rem; align-items: stretch; }
        .book-card__cover { flex: 0 0 76px; width: 76px; border-radius: 0.6rem; background: linear-gradient(160deg, var(--color-primary) 0%, var(--color-accent) 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.45rem; color: #fff; padding: 0.5rem 0.3rem; }
        .book-card__initials { font-size: 1.2rem; font-weight: 700; }
        .book-card__callnum { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.03em; opacity: 0.85; }
        .book-card__content { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 0.55rem; }
        .book-card__top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; }
        .book-card__badge { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: var(--color-primary); }
        .book-card__tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .book-card h3 { margin: 0; font-family: var(--font-display); font-size: 1.05rem; line-height: 1.3; }
        .book-card__meta { margin: 0; color: var(--color-ink-muted); font-size: 0.85rem; }
        .book-card__description { margin: 0; line-height: 1.6; color: var(--color-ink-muted); font-size: 0.9rem; }
        .book-card__footer { display: flex; flex-wrap: wrap; gap: 0.85rem; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.35rem; }
        .book-card__stats { display: flex; flex-wrap: wrap; gap: 0.7rem; color: var(--color-ink-muted); font-size: 0.85rem; }
        .book-card__stats span { display: inline-flex; align-items: center; gap: 0.3rem; }
        .empty-state { padding: 2rem; text-align: center; color: var(--color-ink-muted); }

        /* ---- author / subject cards ---- */
        .authors-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
        .author-card { padding: 0.9rem; display: flex; align-items: center; gap: 0.8rem; }
        .author-avatar { width: 2.75rem; height: 2.75rem; border-radius: 0.6rem; display: grid; place-items: center; font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; padding: 0; flex: 0 0 auto; }
        .author-card h4 { margin: 0; font-size: 0.92rem; }
        .author-card p { margin: 0.15rem 0 0; color: var(--color-ink-muted); font-size: 0.78rem; }

        /* ---- reading path ---- */
        .path-card { display: grid; gap: 1.5rem; padding: 1.75rem; background: var(--color-primary-tint); border: 1px solid var(--color-border); }
        .path-card__intro p { margin: 0.4rem 0 0; color: var(--color-ink-muted); }
        .path-steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.6rem; }
        .path-step { display: grid; grid-template-columns: auto 1fr; gap: 0.9rem; align-items: center; padding: 0.85rem 1rem; border-radius: 0.6rem; background: var(--color-surface); border: 1px solid var(--color-border); }
        .path-step h4 { margin: 0; font-size: 0.95rem; }
        .path-step p { margin: 0.15rem 0 0; color: var(--color-ink-muted); font-size: 0.82rem; }
        .step-index { width: 1.9rem; height: 1.9rem; border-radius: 50%; background: var(--color-primary); color: #fff; display: grid; place-items: center; font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; }

        /* ---- collections ---- */
        .collections-grid { display: grid; grid-template-columns: 1fr; gap: 0.85rem; }
        .collection-card { padding: 1.1rem 1.2rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; color: var(--color-ink-faint); }
        .collection-card__eyebrow { font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-ink-muted); }
        .collection-card h4 { margin: 0.25rem 0 0; color: var(--color-ink); font-size: 0.95rem; }
        .collection-card p { margin: 0.25rem 0 0; color: var(--color-ink-muted); font-size: 0.82rem; }

        /* ---- recent carousel ---- */
        .carousel-row { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(210px, 1fr); gap: 0.85rem; overflow-x: auto; padding-bottom: 0.4rem; scroll-snap-type: x proximity; }
        .recent-card { min-width: 220px; padding: 1.1rem; display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; scroll-snap-align: start; }
        .recent-badge { font-size: 0.7rem; }
        .recent-card h3 { margin: 0; font-size: 0.98rem; font-family: var(--font-display); }
        .recent-card p { margin: 0; color: var(--color-ink-muted); font-size: 0.82rem; }
        .recent-actions { border: none; background: transparent; display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.4rem; color: var(--color-primary); font-weight: 600; font-size: 0.85rem; cursor: pointer; padding: 0; }

        /* ---- most downloaded ---- */
        .download-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
        .download-card { padding: 1rem 1.1rem; display: grid; gap: 0.5rem; }
        .download-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }
        .download-title { font-weight: 700; font-size: 0.95rem; }
        .download-card p { margin: 0; color: var(--color-ink-muted); font-size: 0.85rem; line-height: 1.5; }

        /* ---- faq ---- */
        .faq-list { display: grid; gap: 0.6rem; max-width: 760px; }
        .faq-item { padding: 1rem 1.1rem; }
        .faq-question { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border: none; background: transparent; padding: 0; text-align: left; cursor: pointer; color: var(--color-ink-faint); }
        .faq-question h3 { margin: 0; font-size: 0.95rem; color: var(--color-ink); font-weight: 600; }
        .faq-chevron { transition: transform 0.2s ease; flex: 0 0 auto; }
        .faq-chevron.is-open { transform: rotate(180deg); }
        .faq-answer { margin: 0.75rem 0 0; color: var(--color-ink-muted); line-height: 1.65; font-size: 0.9rem; }

        /* ---- newsletter ---- */
        .newsletter-section { padding: 2.5rem 0 3.5rem; }
        .newsletter-card { display: grid; gap: 1.25rem; padding: 1.75rem; color: #fff; border-color: transparent; }
        .newsletter-card h2 { margin: 0.35rem 0 0; color: #fff; font-family: var(--font-display); }
        .newsletter-card p { margin: 0.7rem 0 0; color: rgba(255,255,255,.82); max-width: 52ch; line-height: 1.6; }
        .eyebrow-inverse { color: rgba(255,255,255,.85); }
        .newsletter-cta { display: flex; flex-wrap: wrap; gap: 0.65rem; }
        .newsletter-cta input { flex: 1 1 240px; border: none; border-radius: 0.5rem; padding: 0.85rem 1rem; outline: none; font-size: 0.95rem; }

        /* ---- filter panel ---- */
        .sticky-panel { position: sticky; top: 1.5rem; align-self: start; }
        .filter-panel { padding: 1.25rem; display: grid; gap: 1.1rem; }
        .panel-title h3 { margin: 0 0 0.3rem; font-size: 1rem; }
        .panel-title span { color: var(--color-ink-muted); font-size: 0.85rem; }
        .filter-group { display: grid; gap: 0.6rem; }
        .filter-group h4 { margin: 0; font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-primary); }
        .filter-option { display: flex; align-items: center; gap: 0.65rem; font-size: 0.88rem; color: var(--color-ink-2); }
        .filter-option input { width: 0.95rem; height: 0.95rem; accent-color: var(--color-primary); }

        @media (min-width: 640px) {
          .authors-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        @media (min-width: 768px) {
          .page-inner { padding: 0 2rem; }
          .hero-grid { grid-template-columns: 1.3fr 0.9fr; align-items: start; }
          .categories-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .book-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .collections-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .download-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .path-steps { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .path-step { grid-template-columns: 1fr; text-align: left; }
        }

        @media (min-width: 1024px) {
          .section { padding-top: 4rem; padding-bottom: 4rem; }
          .hero-section { padding-top: 4.5rem; }
          .page-inner { padding: 0 2.5rem; }
          .categories-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .book-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .featured-layout { grid-template-columns: minmax(0, 1fr) 300px; }
          .authors-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
          .collections-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .download-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .carousel-row { grid-auto-columns: minmax(240px, 1fr); }
          .newsletter-card { grid-template-columns: 1fr auto; align-items: center; padding: 2rem 2.5rem; }
        }
      `}</style>
    </main>
  );
}