import { useState, useMemo, useEffect } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';

const s = (v, fallback = '') => (typeof v === 'string' || typeof v === 'number' ? v : fallback);

const toItem = (d) => {
  const content = typeof d.content === 'string' ? d.content : '';
  const text = content || s(d.summary, s(d.snippet, ''));
  return {
    id: d.id,
    date: s(d.date, d.createdAt?.toDate
      ? d.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : ''),
    category: s(d.category, 'General'),
    title: s(d.title, 'Untitled'),
    snippet: s(d.summary, s(d.snippet, content.slice(0, 220))),
    content,
    premium: !!d.premium,
    imageUrl: s(d.imageUrl, s(d.coverImage, '')),
  };
};

const toHashtag = (d) => ({
  id: d.id,
  tag: s(d.tag, ''),
  category: s(d.category, 'General'),
});

function readTime(article) {
  const text = [article.snippet, article.content].filter(Boolean).join(' ');
  return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
}

export default function CurrentAffairsPage() {
  const [subject, setSubject] = useState('All');
  const [q, setQ] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const { data: items } = useFirestoreCollection({
    name: 'currentAffairs',
    where: [['isActive', '==', true]],
    orderBy: ['createdAt', 'desc'],
    limit: 60,
    fallback: [],
    transform: (docs) => docs.map(toItem),
  });

  const { data: hashtags } = useFirestoreCollection({
    name: 'trendingHashtags',
    orderBy: ['engagement', 'desc'],
    fallback: [],
    transform: (docs) => docs.filter((item) => item.isActive !== false).map(toHashtag).slice(0, 8),
  });

  const subjects = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (subject !== 'All') list = list.filter((i) => i.category === subject);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((i) => (i.title || '').toLowerCase().includes(needle)
        || (i.snippet || '').toLowerCase().includes(needle));
    }
    return list;
  }, [items, subject, q]);

  const lead = filtered[0];
  const stories = filtered.slice(1);
  const brief = filtered.slice(0, 6);

  useEffect(() => {
    document.body.style.overflow = activeArticle ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeArticle]);

  useEffect(() => {
    if (!activeArticle) return;
    const onKey = (e) => { if (e.key === 'Escape') setActiveArticle(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeArticle]);

  return (
    <StudentLayout title="Current Affairs" plainHeader>
      <div className="ca-paper">
        <div className="ca-toolbar">
          <div className="ca-subjects" data-testid="ca-subjects">
            {subjects.map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => setSubject(subj)}
                className={`ca-subject-btn ${subject === subj ? 'is-active' : ''}`}
              >
                {subj}
              </button>
            ))}
          </div>
          <label className="ca-search">
            <Search size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
            <input
              placeholder="Search headlines…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              data-testid="ca-search"
            />
          </label>
        </div>

        <div className="ca-layout">
          <main>
            {lead ? (
              <article
                className="ca-lead"
                onClick={() => setActiveArticle(lead)}
                onKeyDown={(e) => e.key === 'Enter' && setActiveArticle(lead)}
                role="button"
                tabIndex={0}
                data-testid="ca-hero"
              >
                <div>
                  <div className="ca-lead__kicker">{lead.category}</div>
                  <h2 className="ca-lead__title">{lead.title}</h2>
                  <p className="ca-lead__lede">{lead.snippet}</p>
                  <div className="ca-lead__meta">
                    <span>{lead.date}</span>
                    <span className="ca-read-time">{readTime(lead)} min read</span>
                  </div>
                </div>
                {lead.imageUrl && (
                  <img src={lead.imageUrl} alt="" className="ca-lead__thumb" />
                )}
              </article>
            ) : (
              <div className="ca-empty">Nothing published for this subject yet.</div>
            )}

            {stories.length > 0 && (
              <>
                <div className="ca-section-label">More stories</div>
                <div className="ca-story-list" data-testid="ca-grid">
                  {stories.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className="ca-story"
                      onClick={() => setActiveArticle(it)}
                    >
                      <div className="ca-story__top">
                        <span className="ca-story__cat">{it.category}</span>
                        <span>·</span>
                        <span>{it.date}</span>
                        <span>·</span>
                        <span className="ca-read-time">{readTime(it)} min</span>
                      </div>
                      <h3 className="ca-story__title">{it.title}</h3>
                      <p className="ca-story__snippet">{it.snippet}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </main>

          <aside className="ca-aside">
            <div className="ca-aside__block" data-testid="ca-latest">
              <h3 className="ca-aside__heading">In Brief</h3>
              {brief.length > 0 ? (
                <ul className="ca-brief-list">
                  {brief.map((it) => (
                    <li key={it.id}>
                      <button type="button" onClick={() => setActiveArticle(it)}>
                        {it.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>No stories yet.</p>
              )}
            </div>

            {hashtags.length > 0 && (
              <div className="ca-aside__block" data-testid="ca-hashtags">
                <h3 className="ca-aside__heading">Topics</h3>
                <div className="ca-topics">
                  {hashtags.map((h) => (
                    <span key={h.id} className="ca-topic">{h.tag}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {activeArticle && (
          <>
            <motion.div
              className="ca-reader-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
            />
            <motion.div
              className="ca-reader"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              data-testid="ca-overlay"
            >
              <div className="ca-reader__bar">
                <button
                  type="button"
                  className="ca-reader__back"
                  onClick={() => setActiveArticle(null)}
                  data-testid="ca-overlay-close"
                >
                  <ArrowLeft size={15} />
                  Back to edition
                </button>
                <span className="ca-reader__label">Reading</span>
              </div>

              <article className="ca-reader__body">
                <div className="ca-reader__kicker">{activeArticle.category}</div>
                <h1 className="ca-reader__title">{activeArticle.title}</h1>
                <div className="ca-reader__meta">
                  <span>{activeArticle.date}</span>
                  <span className="ca-read-time">{readTime(activeArticle)} min read</span>
                </div>

                {activeArticle.imageUrl && (
                  <img
                    src={activeArticle.imageUrl}
                    alt=""
                    className="ca-reader__img"
                  />
                )}

                <div className="ca-reader__content">
                  <p className="ca-reader__standfirst">{activeArticle.snippet}</p>
                  {activeArticle.content && activeArticle.content !== activeArticle.snippet && (
                    <p>{activeArticle.content}</p>
                  )}
                </div>
              </article>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}
