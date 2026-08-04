import { useMemo, useState } from 'react';
import Link from 'next/link';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';
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
  'NCERT', 'Standard Books', 'Current Affairs', 'Revision', 'Mock Tests',
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

function CategoryCard({ category, index }) {
  const color = colorFor(index);
  return (
    <article className="category-card card card-hover">
      <div className={`category-icon chip-${color}`}>{category.name.slice(0, 2)}</div>
      <div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
      </div>
      <span className="category-count">{category.count} books</span>
    </article>
  );
}

function BookCard({ book }) {
  return (
    <article className="book-card card card-hover">
      <div className="book-card__cover">
        <div className="book-cover-placeholder">{book.title.split(' ').slice(0, 2).map(word => word[0]).join('')}</div>
      </div>
      <div className="book-card__content">
        <div className="book-card__badge">{book.subject}</div>
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
      <div className="book-card__tags">
        {book.tags.map((tag, i) => <span key={tag} className={`chip chip-${colorFor(i + 2)}`}>{tag}</span>)}
      </div>
    </article>
  );
}

function AuthorCard({ name, index }) {
  const color = colorFor(index);
  return (
    <div className="author-card card card-hover">
      <div className={`author-avatar chip-${color}`}>{name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
      <div>
        <h4>{name}</h4>
        <p>Trusted UPSC author</p>
      </div>
    </div>
  );
}

function CollectionCard({ title }) {
  return (
    <div className="collection-card card card-hover">
      <div>
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
        <div className="page-inner">
          <div className="hero-copy">
            <span className="eyebrow">UPSC Books Library</span>
            <h1 className="hero-display">Best UPSC Books & Study Materials</h1>
            <p>Explore recommended UPSC Prelims and Mains books with subject filters, curated collections and a premium reading path designed for serious aspirants.</p>
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
              <BookOpen size={22} />
              <span>Featured on the library</span>
            </div>
            <div className="hero-visual__body">
              <div>
                <h2>300+ UPSC-ready books</h2>
                <p>Browse organized collections, popular authors and the latest additions for focused exam preparation.</p>
              </div>
              <div className="hero-visual__metrics">
                <div>
                  <strong>18k+</strong>
                  <span>Downloads</span>
                </div>
                <div>
                  <strong>24</strong>
                  <span>Categories</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-inner section-spacing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Browse by category</span>
            <h2>Find the right book for every UPSC topic.</h2>
          </div>
          <Link href="#featured" className="text-link">See featured books</Link>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <CategoryCard key={category.id || category.name} category={category} index={index} />
          ))}
        </div>
      </section>

      <section className="page-inner section-spacing featured-section" id="featured">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Featured books</span>
                <h2>Premium UPSC titles ready for download.</h2>
              </div>
              <button type="button" className="btn btn-outline">
                <Filter size={16} /> Filter options
              </button>
            </div>
            <div className="book-grid">
              {featuredBooks.length > 0 ? featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              )) : (
                <div className="empty-state card">No books match your search yet. Try a different keyword or filter.</div>
              )}
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4 sticky-panel">
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

      <section className="page-inner section-spacing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Popular subjects</span>
            <h2>Topics aspirants access most frequently.</h2>
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

      <section className="page-inner section-spacing path-section">
        <div className="path-card card card-hover">
          <div>
            <span className="eyebrow">Recommended path</span>
            <h2>A beginner-friendly study order.</h2>
          </div>
          <div className="path-steps">
            {READING_PATH.map((step, index) => (
              <div key={step} className="path-step">
                <div className="step-index">{index + 1}</div>
                <div>
                  <h4>{step}</h4>
                  <p>{step === 'NCERT' ? 'Build basic concepts first.' : 'A focused stage in your UPSC journey.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-inner section-spacing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Collections</span>
            <h2>Dynamic bundles built from your subject library.</h2>
          </div>
        </div>
        <div className="collections-grid">
          {collectionTitles.map(title => <CollectionCard key={title} title={title} />)}
        </div>
      </section>

      <section className="page-inner section-spacing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Recently added</span>
            <h2>New arrivals for fast-moving topics.</h2>
          </div>
        </div>
        <div className="carousel-row">
          {recentBooks.map((book) => (
            <div key={book.id} className="recent-card card card-hover">
              <div className="recent-badge chip chip-primary">Latest</div>
              <h3>{book.title}</h3>
              <p>{book.subject}</p>
              <div className="recent-actions">
                <button className="btn btn-ghost" onClick={() => window.open(book.url, '_blank')}>Preview</button>
                <ArrowRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-inner section-spacing">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Most downloaded</span>
            <h2>Books aspirants open again and again.</h2>
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

      <section className="page-inner section-spacing faq-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2>Questions every UPSC reader asks.</h2>
          </div>
        </div>
        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const open = openFaq === index;
            return (
              <div key={faq.q} className="faq-item card card-hover">
                <button type="button" className="faq-question" onClick={() => setOpenFaq(open ? null : index)}>
                  <div>
                    <h3>{faq.q}</h3>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s ease' }}
                  />
                </button>
                {open && <p className="faq-answer">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="newsletter-section">
        <div className="page-inner newsletter-card card card-hover grad-hero">
          <div>
            <span className="eyebrow eyebrow-inverse">Stay updated</span>
            <h2>Get alerts when new UPSC books are added.</h2>
            <p>Save time and never miss the latest essential downloads for Prelims and Mains.</p>
          </div>
          <div className="newsletter-cta">
            <input type="email" placeholder="Enter your email address" aria-label="Newsletter email" />
            <button type="button" className="btn btn-dark">Notify me</button>
          </div>
        </div>
      </section>

      <style jsx>{`
        .books-page { background: var(--color-bg); color: var(--color-ink); }
        .page-inner { max-width: 1240px; margin: 0 auto; padding: 0 1.5rem; }
        .section-spacing { padding-top: 4.5rem; padding-bottom: 4.5rem; }
        .hero-section { padding: 5rem 0 3rem; }
        .hero-copy { max-width: 640px; }
        .hero-copy .eyebrow { display: inline-flex; margin-bottom: 1rem; }
        .hero-copy h1 { font-size: clamp(2.4rem, 4vw, 4rem); line-height: 1.05; margin-bottom: 1.25rem; }
        .hero-copy p { color: var(--color-ink-muted); max-width: 680px; line-height: 1.8; margin-bottom: 1.75rem; }
        .search-bar { display: flex; align-items: center; gap: 0.85rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 999px; padding: 0.95rem 1.25rem; box-shadow: 0 18px 50px rgba(15, 15, 20, 0.06); color: var(--color-ink-faint); }
        .search-bar input { width: 100%; border: none; outline: none; font-size: 1rem; color: var(--color-ink); background: transparent; }
        .filter-chips { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.4rem; }
        .hero-visual { padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem; min-height: 280px; background: var(--color-primary-tint); }
        .hero-visual__header { display: inline-flex; align-items: center; gap: 0.85rem; font-weight: 700; color: var(--color-primary); }
        .hero-visual__body { display: flex; flex-direction: column; gap: 1.4rem; }
        .hero-visual__body h2 { font-size: 1.4rem; margin: 0; }
        .hero-visual__body p { margin: 0.6rem 0 0; color: var(--color-ink-muted); line-height: 1.7; }
        .hero-visual__metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        .hero-visual__metrics div { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 1rem; padding: 1rem 1.25rem; }
        .hero-visual__metrics strong { display: block; font-size: 1.55rem; margin-bottom: 0.35rem; color: var(--color-primary); }
        .hero-visual__metrics span { color: var(--color-ink-muted); font-size: 0.85rem; }
        .section-heading { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1.75rem; }
        .section-heading h2 { font-size: clamp(1.7rem, 2.5vw, 2.4rem); margin-top: 0.35rem; }
        .text-link { color: var(--color-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 0.35rem; }
        .categories-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1rem; }
        .category-card { padding: 1.35rem 1.35rem 1.2rem; display: grid; gap: 1rem; }
        .category-icon { width: 3rem; height: 3rem; border-radius: 1rem; display: grid; place-items: center; font-weight: 800; font-size: 1.05rem; padding: 0; }
        .category-card h3 { margin: 0; font-size: 1.1rem; }
        .category-card p { margin: 0.55rem 0 0; color: var(--color-ink-muted); line-height: 1.7; font-size: 0.95rem; }
        .category-count { justify-self: end; color: var(--color-primary); font-size: 0.92rem; font-weight: 700; }
        .featured-section .grid { gap: 2rem; }
        .book-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .book-card { display: grid; grid-template-columns: auto 1fr; gap: 1.25rem; padding: 1.5rem; position: relative; overflow: hidden; }
        .book-card__cover { min-width: 100px; min-height: 140px; background: linear-gradient(160deg, var(--color-primary) 0%, var(--color-accent) 100%); border-radius: 1.25rem; display: grid; place-items: center; color: #fff; font-size: 1.5rem; font-weight: 700; }
        .book-card__content { display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; }
        .book-card__badge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700; color: var(--color-primary); }
        .book-card h3 { margin: 0.35rem 0 0; font-size: 1.2rem; }
        .book-card__meta { margin: 0.5rem 0 0; color: var(--color-ink-muted); font-size: 0.92rem; }
        .book-card__description { margin: 0; line-height: 1.8; color: var(--color-ink-muted); }
        .book-card__footer { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; }
        .book-card__stats { display: flex; flex-wrap: wrap; gap: 0.85rem; color: var(--color-ink-muted); font-size: 0.92rem; }
        .book-card__stats span { display: inline-flex; align-items: center; gap: 0.35rem; }
        .book-card__tags { position: absolute; right: 1.5rem; bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .author-card { padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
        .author-avatar { width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; font-weight: 800; font-size: 1.1rem; padding: 0; }
        .author-card h4 { margin: 0; font-size: 1rem; }
        .author-card p { margin: 0.25rem 0 0; color: var(--color-ink-muted); font-size: 0.85rem; }
        .path-card { display: grid; gap: 1.5rem; padding: 2rem; background: var(--color-primary-tint); }
        .path-steps { display: grid; gap: 1rem; }
        .path-step { display: grid; grid-template-columns: auto 1fr; gap: 1rem; align-items: center; padding: 1.15rem 1.25rem; border-radius: 1.25rem; background: var(--color-surface); border: 1px solid var(--color-border); }
        .path-step h4 { margin: 0; }
        .path-step p { margin: 0.25rem 0 0; color: var(--color-ink-muted); font-size: 0.9rem; }
        .step-index { width: 2.35rem; height: 2.35rem; border-radius: 50%; background: var(--color-primary); color: #fff; display: grid; place-items: center; font-weight: 700; }
        .collections-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1rem; }
        .collection-card { padding: 1.35rem 1.4rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; color: var(--color-ink-faint); }
        .collection-card h4 { margin: 0; color: var(--color-ink); }
        .collection-card p { margin: 0.35rem 0 0; color: var(--color-ink-muted); font-size: 0.9rem; }
        .carousel-row { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 1fr); gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; scroll-snap-type: x proximity; }
        .recent-card { min-width: 260px; padding: 1.5rem; position: relative; }
        .recent-badge { margin-bottom: 1rem; }
        .recent-card h3 { margin: 0; font-size: 1.05rem; }
        .recent-card p { margin: 0.4rem 0 0; color: var(--color-ink-muted); font-size: 0.9rem; }
        .recent-actions { display: inline-flex; align-items: center; gap: 0.75rem; margin-top: 1.2rem; color: var(--color-primary); }
        .download-grid { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 1rem; }
        .download-card { padding: 1.35rem; display: grid; gap: 1rem; }
        .download-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
        .download-title { font-weight: 700; font-size: 1.05rem; }
        .download-card p { margin: 0; color: var(--color-ink-muted); font-size: 0.9rem; }
        .faq-list { display: grid; gap: 1rem; }
        .faq-item { padding: 1.2rem; }
        .faq-question { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border: none; background: transparent; padding: 0; text-align: left; cursor: pointer; color: var(--color-ink-faint); }
        .faq-question h3 { margin: 0; font-size: 1rem; color: var(--color-ink); }
        .faq-answer { margin-top: 1rem; color: var(--color-ink-muted); line-height: 1.8; }
        .newsletter-section { padding: 3rem 0 5rem; }
        .newsletter-card { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 1.5rem; padding: 2rem 2.5rem; color: #fff; border-color: transparent; }
        .newsletter-card h2 { margin: 0.4rem 0 0; color: #fff; }
        .newsletter-card p { margin: 0.8rem 0 0; color: rgba(255,255,255,.82); max-width: 560px; }
        .eyebrow-inverse { color: rgba(255,255,255,.85); }
        .newsletter-cta { display: flex; flex-wrap: wrap; gap: 0.85rem; }
        .newsletter-cta input { min-width: 280px; border: none; border-radius: 999px; padding: 0.95rem 1.15rem; outline: none; font-size: 1rem; }
        .sticky-panel { position: sticky; top: 1.5rem; align-self: start; }
        .filter-panel { padding: 1.5rem; display: grid; gap: 1.25rem; }
        .panel-title h3 { margin: 0 0 0.35rem; }
        .panel-title span { color: var(--color-ink-muted); font-size: 0.95rem; }
        .filter-group { display: grid; gap: 0.75rem; }
        .filter-group h4 { margin: 0; font-size: 0.95rem; color: var(--color-primary); }
        .filter-option { display: flex; align-items: center; gap: 0.75rem; font-size: 0.95rem; color: var(--color-ink-2); }
        .filter-option input { width: 1rem; height: 1rem; accent-color: var(--color-primary); }
        .btn-outline { border: 1px solid var(--color-border-strong); color: var(--color-primary); background: var(--color-surface); display: inline-flex; align-items: center; gap: 0.5rem; }
        .btn-outline:hover { background: var(--color-primary-tint); border-color: var(--color-primary); }
        .empty-state { padding: 2rem; text-align: center; color: var(--color-ink-muted); }

        @media (min-width: 768px) {
          .page-inner { padding: 0 2rem; }
          .categories-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .book-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .collections-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .download-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (min-width: 1024px) {
          .hero-section { padding-top: 6rem; }
          .page-inner { padding: 0 2.5rem; }
          .page-inner .section-spacing { padding-top: 5rem; padding-bottom: 5rem; }
          .page-inner .section-heading { gap: 2rem; }
          .categories-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .book-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
          .collections-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .download-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .carousel-row { grid-auto-columns: minmax(260px, 1fr); }
        }
      `}</style>
    </main>
  );
}