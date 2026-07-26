import { useState, useMemo } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight, Search, Filter, BookmarkPlus, Lock, Clock, ChevronRight, Newspaper, Coffee, Database, Sparkles
} from 'lucide-react';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';

const CATEGORIES = ['All', 'Polity', 'Economy', 'Environment', 'International', 'S&T', 'History', 'Society'];

const MOCK_ITEMS = [
  { id:'m1', date:'28 Jan 2026', category:'Polity',        title:'The Election Commission tables new voter roll transparency framework', snippet:'Draft rules would open sections of the electoral roll updation process to civic-society audit, subject to certain redactions.', mins:4, tag:'Prelims + Mains' },
  { id:'m2', date:'28 Jan 2026', category:'Economy',       title:"RBI signals policy pivot: what the December MPC minutes reveal", snippet:"Members flag disinflation stall in services; the balance shifts towards a data-first easing cycle in Q2 2026.", mins:5, tag:'Mains GS-III', premium:true },
  { id:'m3', date:'27 Jan 2026', category:'Environment',   title:"IPCC AR6 synthesis and India's revised NDC targets: a reader", snippet:"A quick primer on where the numbers moved, what India committed, and the equity argument for developing economies.", mins:6, tag:'Prelims + Mains' },
  { id:'m4', date:'27 Jan 2026', category:'International', title:"Quad ministerial 2026 — reading between the joint statements", snippet:"The choreography of language, the omissions on Taiwan, and the new focus on subsea infrastructure.", mins:5, tag:'GS-II', premium:true },
  { id:'m5', date:'26 Jan 2026', category:'S&T',           title:"ISRO's Gaganyaan 2 uncrewed test: what to watch for", snippet:"Test sequence, key subsystems, and how it stitches into the crewed 2027 timeline.", mins:4, tag:'Prelims' },
  { id:'m6', date:'26 Jan 2026', category:'History',       title:"Republic Day 2026: 75 years of the Constitution in tableau", snippet:"A cultural read of a civic anniversary, and what changed since the 50th year commemorations.", mins:3, tag:'Culture' },
  { id:'m7', date:'25 Jan 2026', category:'Society',       title:"NCRB 2025 data on crimes against women: three trends", snippet:"Reporting improved; conviction rates barely moved. A closer look at the state-wise breakdown.", mins:6, tag:'GS-I / GS-II' },
];

// Category → chip class
const CAT_CHIP = {
  Polity:'chip-violet', Economy:'chip-blue', Environment:'chip-green', International:'chip-pink',
  'S&T':'chip-cyan', History:'chip-amber', Society:'chip-lime', Culture:'chip-amber',
};

// Safe primitive coercion
const s = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return fallback;
};
const num = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };

// Firestore doc → uniform item
const toItem = (d) => {
  const content = typeof d.content === 'string' ? d.content : '';
  return {
    id: d.id,
    date: s(d.date, (d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '')),
    category: s(d.category, 'General'),
    title: s(d.title, 'Untitled'),
    snippet: s(d.summary, s(d.snippet, content.slice(0, 200))),
    mins: num(d.readTime ?? d.mins, 4),
    tag: s(d.tag, (Array.isArray(d.tags) ? d.tags.filter(t => typeof t === 'string').join(', ') : 'General')),
    premium: !!d.premium,
  };
};

export default function CurrentAffairsPage() {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  const { data, isMock, source } = useFirestoreCollection({
    name: 'currentAffairs',
    where: [['isActive', '==', true]],
    orderBy: ['createdAt', 'desc'],
    limit: 40,
    fallback: MOCK_ITEMS,
    transform: (docs) => docs.map(toItem),
  });

  const [active, setActive] = useState(null);
  const items = data;
  const filtered = items.filter(i =>
    (cat === 'All' || i.category === cat) &&
    (q.trim() === '' || (i.title || '').toLowerCase().includes(q.toLowerCase()))
  );
  const current = active || filtered[0] || items[0];

  return (
    <StudentLayout title="The Morning Brief" subtitle="An editorial daily for civil services aspirants.">
      {/* Data source pill */}
      {isMock && (
        <div className="mb-4 flex items-center gap-2 chip chip-amber" data-testid="ca-data-source">
          <Database size={11} strokeWidth={1.75} />
          Showing sample content · Publish articles from Admin → Current Affairs to see live data here
        </div>
      )}

      {/* Hero strip */}
      <div className="card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 grad-ink-glow"
           style={{ color: 'var(--color-bg)', borderColor: 'transparent' }}
           data-testid="ca-hero">
        <div>
          <div className="flex items-center gap-2">
            <Coffee size={15} strokeWidth={1.6} style={{ color: '#F97066' }} />
            <span className="eyebrow" style={{ color: '#B7BFB8' }}>Live from your editorial desk</span>
          </div>
          <h2 className="mt-3 hero-display" style={{ fontSize: 32, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            {filtered.length} briefs. <span className="grad-text">{items.reduce((s, x) => s + (x.mins||0), 0)} minutes.</span><br />
            Fully mapped to Prelims + Mains.
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="chip" style={{ background: 'rgba(255,255,255,0.06)', color: '#B7BFB8', borderColor: 'rgba(255,255,255,0.14)' }}>
            {items.reduce((s, x) => s + (x.mins||0), 0)} min · {items.length} stories
          </span>
          <button className="btn btn-accent" data-testid="ca-mark-read">Mark all read</button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl flex-1"
             style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-ink-muted)' }} />
          <input placeholder="Search headlines, tags, categories…"
                 value={q} onChange={e => setQ(e.target.value)}
                 data-testid="ca-search"
                 className="bg-transparent outline-none text-[14px] flex-1" style={{ color: 'var(--color-ink)' }} />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1" data-testid="ca-categories">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)}
                    className="px-3.5 py-2 rounded-full text-[12.5px] whitespace-nowrap"
                    style={{
                      border: `1px solid ${cat === c ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: cat === c ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: cat === c ? '#fff' : 'var(--color-ink-muted)',
                      fontWeight: 600,
                      transition: 'background-color .15s, color .15s, border-color .15s'
                    }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Split view */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-6 card overflow-hidden" data-testid="ca-list">
          {filtered.map((it, i) => (
            <button key={it.id} onClick={() => setActive(it)}
                    className={`w-full text-left p-5 md:p-6 flex gap-5 items-start ${i < filtered.length - 1 ? 'hairline-b' : ''}`}
                    style={{
                      background: (current && current.id === it.id) ? 'var(--color-surface-alt)' : 'transparent',
                      transition: 'background .15s ease',
                      cursor: 'pointer'
                    }}>
              <div className="min-w-[62px] text-center">
                <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>{(it.date||'').split(' ').slice(0,2).join(' ')}</div>
                <span className={`chip mt-1.5 ${CAT_CHIP[it.category] || 'chip-primary'}`} style={{ padding: '2px 8px', fontSize: 10 }}>{it.category}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-[16.5px] leading-[1.35]" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>{it.title}</div>
                <div className="mt-1.5 flex items-center gap-2 text-[11.5px] flex-wrap" style={{ color: 'var(--color-ink-muted)' }}>
                  <span className="flex items-center gap-1"><Clock size={11} strokeWidth={1.5} /> {it.mins} min</span>
                  <span>·</span><span>{it.tag}</span>
                  {it.premium && <span className="chip chip-gold ml-1" style={{ padding: '1px 6px', fontSize: 9 }}><Lock size={9} /> Plus</span>}
                </div>
              </div>
              <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)', flexShrink: 0 }} />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-[13.5px]" style={{ color: 'var(--color-ink-muted)' }}>
              No headlines match the filter. Try another category.
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-6 card p-7 md:p-9 h-fit sticky top-24" data-testid="ca-reader">
          <AnimatePresence mode="wait">
            {current && (
              <motion.article key={current.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: .3 }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`chip ${CAT_CHIP[current.category] || 'chip-primary'}`}>{current.category}</span>
                  {current.premium && <span className="chip chip-gold"><Lock size={10} /> Plus</span>}
                  <span className="text-[12px] ml-auto font-mono" style={{ color: 'var(--color-ink-faint)' }}>{current.date}</span>
                </div>
                <h1 className="hero-display" style={{ fontSize: 30, lineHeight: 1.12, letterSpacing: '-0.03em' }}>
                  {current.title}
                </h1>
                <div className="mt-3 flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                  <Clock size={12} strokeWidth={1.5} /> {current.mins} min read · {current.tag}
                </div>

                <div className="hairline-t mt-6 pt-6 flex flex-col gap-4 text-[15px] leading-[1.75]" style={{ color: 'var(--color-ink-2)' }}>
                  <p className="font-italic-serif" style={{ fontSize: 17, color: 'var(--color-ink-muted)' }}>
                    {current.snippet}
                  </p>
                  <p>Notes Cafe editorial brief maps each story to the UPSC syllabus so you can revise once and reference many times.</p>
                  {isMock && (
                    <p className="text-[13.5px]" style={{ color: 'var(--color-ink-faint)' }}>
                      This is sample content for the design preview. Publish an article from the admin dashboard and it will appear here in real time.
                    </p>
                  )}
                </div>

                <div className="mt-8 hairline-t pt-5 flex items-center gap-2">
                  <button className="btn btn-primary" data-testid="ca-read-full">
                    Read full brief <ArrowUpRight size={14} />
                  </button>
                  <button className="btn btn-ghost" data-testid="ca-bookmark">
                    <BookmarkPlus size={14} strokeWidth={1.6} /> Save to notes
                  </button>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StudentLayout>
  );
}
