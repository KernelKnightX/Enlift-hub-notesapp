import { useState, useMemo, useEffect, useRef } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Lock, X, MoreHorizontal } from 'lucide-react';
import useFirestoreCollection from '@/hooks/useFirestoreCollection';

const CAT_CHIP = {
  Polity: 'chip-violet', Economy: 'chip-blue', Environment: 'chip-green',
  International: 'chip-pink', Geopolitics: 'chip-pink', World: 'chip-cyan',
  National: 'chip-blue', Tech: 'chip-cyan', 'S&T': 'chip-cyan',
  History: 'chip-amber', Society: 'chip-lime', Culture: 'chip-amber',
  General: 'chip-primary',
};
const chipFor = (cat) => CAT_CHIP[cat] || 'chip-primary';

// ---------------------------------------------------------------------------
// Helpers: safe coercion from raw Firestore docs — this is a shape/fallback
// guard only, not sample data. No mock articles or hashtags are shipped.
// ---------------------------------------------------------------------------
const s = (v, fallback = '') => (typeof v === 'string' || typeof v === 'number' ? v : fallback);
const num = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };

const toItem = (d) => {
  const content = typeof d.content === 'string' ? d.content : '';
  return {
    id: d.id,
    date: s(d.date, d.createdAt?.toDate
      ? d.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : ''),
    category: s(d.category, 'General'), // subject — entirely whatever admin sets
    title: s(d.title, 'Untitled'),
    snippet: s(d.summary, s(d.snippet, content.slice(0, 220))),
    content,
    premium: !!d.premium,
    imageUrl: s(d.imageUrl, s(d.coverImage, '')),
    author: {
      name: s(d.authorName, s(d.author?.name, '')),
      avatarUrl: s(d.authorAvatar, s(d.author?.avatarUrl, '')),
    },
  };
};

const toHashtag = (d) => ({
  id: d.id,
  tag: s(d.tag, ''),
  category: s(d.category, 'General'),
  engagement: num(d.engagement ?? d.engagementCount, 0),
});

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=900&q=60';
const PLACEHOLDER_AVATAR = 'https://i.pravatar.cc/64?img=1';

export default function CurrentAffairsPage() {
  const [subject, setSubject] = useState('All');
  const [q, setQ] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  const overlayHistoryPushed = useRef(false);

  const closeOverlay = () => {
    if (overlayHistoryPushed.current && typeof window !== 'undefined') {
      window.history.back();
      return;
    }
    setActiveArticle(null);
  };

  // Articles come from admin → Firestore, newest first. No mock fallback —
  // if nothing is published yet, the page shows real empty states instead
  // of sample content.
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
    transform: (docs) => docs.map(toHashtag),
  });

  // Subjects are derived from whatever categories the admin has actually
  // published (Geopolitics, World, National, Tech, ...) — nothing fixed here.
  const subjects = useMemo(() => {
    const set = new Set(items.map(i => i.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    let list = items; // already newest-first from the query
    if (subject !== 'All') list = list.filter(i => i.category === subject);
    if (q.trim() !== '') list = list.filter(i => (i.title || '').toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [items, subject, q]);

  // The most recent article is always the big hero — no manual flagging.
  const hero = filtered[0];
  const grid = filtered.slice(1, 7);
  const latest = filtered.slice(1, 6);

  // Lock background scroll while the overlay is open
  useEffect(() => {
    document.body.style.overflow = activeArticle ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [activeArticle]);

  // Escape key always closes the overlay, no matter how far the reader
  // has scrolled down inside it.
  useEffect(() => {
    if (!activeArticle) return;
    const onKey = (e) => { if (e.key === 'Escape') setActiveArticle(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeArticle]);

  return (
    <StudentLayout title="Current Affairs" subtitle="An editorial daily for civil services aspirants.">
      {/* Subject filter (dynamic) + search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 hairline-b pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" data-testid="ca-subjects">
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSubject(subj)}
              className="px-3.5 py-2 rounded-full text-[12.5px] whitespace-nowrap"
              style={{
                border: `1px solid ${subject === subj ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: subject === subj ? 'var(--color-primary)' : 'var(--color-surface)',
                color: subject === subj ? '#fff' : 'var(--color-ink-muted)',
                fontWeight: 600,
                transition: 'background-color .15s, color .15s, border-color .15s',
              }}
            >
              {subj}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full w-full md:w-auto"
             style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
          <Search size={14} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)' }} />
          <input
            placeholder="Search news…"
            value={q}
            onChange={e => setQ(e.target.value)}
            data-testid="ca-search"
            className="bg-transparent outline-none text-[13.5px] flex-1 min-w-[140px]"
            style={{ color: 'var(--color-ink)' }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* ------------------------------------------------------------- */}
        {/* Left column: hero + grid                                     */}
        {/* ------------------------------------------------------------- */}
        <div>
          {hero && (
            <motion.div
              layoutId={`ca-card-${hero.id}`}
              onClick={() => setActiveArticle(hero)}
              className="relative rounded-2xl overflow-hidden cursor-pointer card-hover"
              style={{ height: 420 }}
              data-testid="ca-hero"
            >
              <motion.img
                layoutId={`ca-img-${hero.id}`}
                src={hero.imageUrl || PLACEHOLDER_IMG}
                alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)',
              }} />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
                <div className="flex items-center gap-2 mb-3 text-[13px]">
                  <span className="chip" style={{ background: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}>
                    {hero.category}
                  </span>
                  {hero.premium && (
                    <span className="chip chip-gold" style={{ padding: '1px 8px', fontSize: 10 }}>
                      <Lock size={9} /> Plus
                    </span>
                  )}
                </div>
                <h1 className="hero-display" style={{ fontSize: 30, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                  {hero.title}
                </h1>
                <p className="mt-2 text-[14px] clamp-2" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 640 }}>
                  {hero.snippet}
                </p>
              </div>
            </motion.div>
          )}

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="ca-grid">
            {grid.map(it => (
              <motion.div
                key={it.id}
                layoutId={`ca-card-${it.id}`}
                onClick={() => setActiveArticle(it)}
                className="cursor-pointer group"
              >
                <motion.div layoutId={`ca-img-${it.id}`} className="rounded-xl overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
                  <img
                    src={it.imageUrl || PLACEHOLDER_IMG}
                    alt={it.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </motion.div>
                <div className="mt-3 text-[15.5px] clamp-2" style={{ fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-ink)' }}>
                  {it.title}
                </div>
                <div className="mt-2">
                  <span className={`chip ${chipFor(it.category)}`} style={{ padding: '2px 9px', fontSize: 10.5 }}>
                    {it.category}
                  </span>
                  {it.premium && <Lock size={11} strokeWidth={1.75} className="ml-2 inline align-middle" style={{ color: 'var(--color-gold)' }} />}
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full p-10 text-center text-[13.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                Nothing published for this subject yet.
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Sidebar: Latest News + Trending Hashtags                      */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-col gap-8">
          <div data-testid="ca-latest">
            <h3 className="hero-display" style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Latest News</h3>
            <div className="mt-4 flex flex-col gap-4">
              {latest.map(it => (
                <div key={it.id} onClick={() => setActiveArticle(it)} className="flex gap-3 group cursor-pointer">
                  <motion.div layoutId={`ca-card-${it.id}-side`} className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: 64, height: 64 }}>
                    <img
                      src={it.imageUrl || PLACEHOLDER_IMG}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </motion.div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] clamp-2" style={{ fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--color-ink)' }}>
                      {it.title}
                    </div>
                    <div className="mt-1 text-[11.5px]" style={{ color: 'var(--color-ink-faint)' }}>
                      {it.category}
                    </div>
                  </div>
                </div>
              ))}
              {latest.length === 0 && (
                <div className="text-[13px]" style={{ color: 'var(--color-ink-faint)' }}>Nothing else published yet.</div>
              )}
            </div>
          </div>

          <div className="hairline-t pt-6" data-testid="ca-hashtags">
            <h3 className="hero-display" style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Trending Hashtags</h3>
            <div className="mt-4 flex flex-col">
              {hashtags.map((h, i) => (
                <div key={h.id} className={`flex items-start justify-between gap-2 py-3 ${i < hashtags.length - 1 ? 'hairline-b' : ''}`}>
                  <div className="min-w-0">
                    <div className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>{h.category} · Trending</div>
                    <div className="text-[14px] mt-0.5" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{h.tag}</div>
                    <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                      {h.engagement.toLocaleString('en-IN')} Engagement
                    </div>
                  </div>
                  <MoreHorizontal size={16} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
                </div>
              ))}
              {hashtags.length === 0 && (
                <div className="text-[13px] py-2" style={{ color: 'var(--color-ink-faint)' }}>No trending tags yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Expanding overlay reader — grows from the clicked card        */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {activeArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(15,15,20,0.55)', backdropFilter: 'blur(2px)' }}
            />
            {/* Pinned to the viewport (not inside the scrolling panel below),
                so it stays visible no matter how far the reader has scrolled. */}
            <button
              onClick={() => setActiveArticle(null)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                position: 'fixed', top: 16, right: 16, zIndex: 60,
                background: 'rgba(15,15,20,0.65)', color: '#fff',
              }}
              data-testid="ca-overlay-close"
              aria-label="Close article"
            >
              <X size={18} />
            </button>

            <div
              className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-0 md:p-6 overflow-y-auto"
              onClick={() => {
                if (overlayHistoryPushed.current && typeof window !== 'undefined') {
                  window.history.back();
                  return;
                }
                setActiveArticle(null);
              }}
            >
              <motion.div
                layoutId={`ca-card-${activeArticle.id}`}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="relative w-full md:max-w-3xl bg-white md:rounded-2xl overflow-hidden"
                style={{ background: 'var(--color-surface)', minHeight: '100vh' }}
                data-testid="ca-overlay"
                onClick={(event) => event.stopPropagation()}
              >
                <motion.img
                  layoutId={`ca-img-${activeArticle.id}`}
                  src={activeArticle.imageUrl || PLACEHOLDER_IMG}
                  alt={activeArticle.title}
                  className="w-full object-cover"
                  style={{ height: 320 }}
                />

                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.25 }}
                  className="p-7 md:p-9"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`chip ${chipFor(activeArticle.category)}`}>{activeArticle.category}</span>
                    {activeArticle.premium && <span className="chip chip-gold"><Lock size={10} /> Plus</span>}
                    <span className="text-[12px] ml-auto font-mono" style={{ color: 'var(--color-ink-faint)' }}>
                      {activeArticle.date}
                    </span>
                  </div>

                  <h1 className="hero-display" style={{ fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.03em' }}>
                    {activeArticle.title}
                  </h1>

                  {activeArticle.author.name && (
                    <div className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
                      <img
                        src={activeArticle.author.avatarUrl || PLACEHOLDER_AVATAR}
                        alt={activeArticle.author.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      {activeArticle.author.name}
                    </div>
                  )}

                  <div className="hairline-t mt-6 pt-6 flex flex-col gap-4 text-[15px] leading-[1.75]" style={{ color: 'var(--color-ink-2)' }}>
                    <p className="font-italic-serif" style={{ fontSize: 17, color: 'var(--color-ink-muted)' }}>
                      {activeArticle.snippet}
                    </p>
                    {activeArticle.content && activeArticle.content !== activeArticle.snippet && (
                      <p style={{ whiteSpace: 'pre-line' }}>{activeArticle.content}</p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}