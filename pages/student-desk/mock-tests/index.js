import { useState, useMemo } from 'react';
import Link from 'next/link';
import StudentLayout from '@/layouts/StudentLayout';
import { motion } from 'framer-motion';
import {
  Play, ClipboardCheck, Database, Search,
  ClipboardList, Landmark, Globe2, FileText, Star, Leaf, BookOpen
} from 'lucide-react';
import useFirestoreCollection from '@/hooks/useFirestoreCollection';

const EXAM_TABS = ['CSE Prelims', 'CSE Mains', 'CAPF', 'CDS', 'IFoS', 'ESE'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TEST_TYPES = [
  { key: 'full', label: 'Full Length Tests' },
  { key: 'sectional', label: 'Sectional Tests' },
  { key: 'topic', label: 'Topic Tests' },
  { key: 'pyq', label: 'Previous Year Papers' },
];
const DURATION_BUCKETS = [
  { key: 'all', label: 'All Durations', test: () => true },
  { key: 'u30', label: 'Under 30 min', test: (t) => t < 30 },
  { key: '30-60', label: '30–60 min', test: (t) => t >= 30 && t <= 60 },
  { key: '60-120', label: '60–120 min', test: (t) => t > 60 && t <= 120 },
  { key: '120p', label: '120+ min', test: (t) => t > 120 },
];

const MOCKS = {
  'CSE Prelims': [
    { id:'k1', name: 'Full-Length Mock #12', subj:'General Studies I', qs:100, mks:200, time:120, level:'Hard',   attempts:2412, exam:'CSE Prelims', type:'full',      rating:4.8, reviews:824 },
    { id:'k2', name: 'Sectional: Polity',    subj:'Polity',           qs:25,  mks:50,  time:30,  level:'Medium', attempts:1204, exam:'CSE Prelims', type:'sectional', rating:4.7, reviews:612 },
    { id:'k3', name: 'Sectional: Economy',   subj:'Economy',          qs:25,  mks:50,  time:30,  level:'Medium', attempts:988,  exam:'CSE Prelims', type:'sectional', rating:4.6, reviews:512 },
    { id:'k4', name: 'Full-Length Mock #11', subj:'General Studies I', qs:100, mks:200, time:120, level:'Medium', attempts:3560, exam:'CSE Prelims', type:'full',      rating:4.9, reviews:956 },
  ],
  'CSE Mains': [
    { id:'k5', name: 'Answer Writing: GS-II', subj:'GS-II',        qs:20, mks:250, time:180, level:'Hard',   attempts:812, exam:'CSE Mains', type:'topic',     rating:4.5, reviews:312 },
    { id:'k6', name: 'Essay Practice: Set 3',  subj:'Essay',       qs:2,  mks:250, time:180, level:'Medium', attempts:640, exam:'CSE Mains', type:'topic',     rating:4.6, reviews:288 },
  ],
  'CAPF':   [{ id:'k7', name:'CAPF Paper I Mock #4',  subj:'GS',        qs:125, mks:250, time:120, level:'Medium', attempts:604, exam:'CAPF', type:'full',     rating:4.6, reviews:190 }],
  'CDS':    [{ id:'k8', name:'CDS English Mock #6',   subj:'English',   qs:120, mks:100, time:120, level:'Easy',   attempts:410, exam:'CDS', type:'sectional', rating:4.5, reviews:140 }],
  'IFoS':   [{ id:'k9', name:'IFoS General English',  subj:'English',   qs:8,   mks:300, time:180, level:'Medium', attempts:172, exam:'IFoS', type:'topic',    rating:4.4, reviews:64  }],
  'ESE':    [{ id:'k10',name:'ESE GS Mock #2',        subj:'GS',        qs:100, mks:200, time:120, level:'Hard',   attempts:302, exam:'ESE', type:'full',      rating:4.7, reviews:98  }],
};
const ALL_MOCKS = Object.values(MOCKS).flat();

// Safe primitive coercion — never render an object as React child
const s = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return fallback;
};
const num = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toMock = (d) => ({
  id: d.id,
  name: s(d.title, s(d.name, 'Mock Test')),
  subj: s(d.subject, s(d.subj, 'General Studies')),
  qs:   num(d.questions?.length ?? d.questions ?? d.totalQuestions ?? d.qs, 0),
  mks:  num(d.marks ?? d.totalMarks ?? d.mks, 0),
  time: num(d.duration ?? d.time, 60),
  level: s(d.difficulty, s(d.level, 'Medium')),
  attempts: num(d.attempts, 0),
  exam: s(d.exam, s(d.examType, 'CSE Prelims')).replace(/^UPSC\s+/i, ''),
  // type/rating/reviews are optional — real Firestore docs usually won't have
  // them yet, so leave them undefined here and derive sensible values at
  // render time instead of baking in fake defaults.
  type: d.type ? s(d.type) : undefined,
  rating: d.rating != null ? num(d.rating) : undefined,
  reviews: d.reviews != null ? num(d.reviews) : undefined,
});

// Deterministic string hash so the same subject/name always maps to the
// same visual "flavor" — gives cards variety even when no explicit type is set.
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TYPE_ORDER = ['full', 'sectional', 'topic', 'pyq'];

function inferType(m) {
  if (m.type && TYPE_META[m.type]) return m.type;
  const text = `${m.name} ${m.subj}`.toLowerCase();
  if (/pyq|previous year/.test(text)) return 'pyq';
  if (/full[-\s]?length/.test(text)) return 'full';
  if (/section|polity|economy|history|geography|english/.test(text)) return 'sectional';
  if (/essay|answer writing|topic/.test(text)) return 'topic';
  // No signal at all — pick a stable "random" type from the name so
  // otherwise-identical cards (e.g. all "General Studies") still vary.
  return TYPE_ORDER[hashStr(m.name || m.subj || 'x') % TYPE_ORDER.length];
}

// --- Card styling by test type: icon, label, and accent color ---
const TYPE_META = {
  full:      { label: 'FULL LENGTH', icon: ClipboardList, colorVar: '--color-primary' },
  sectional: { label: 'SECTIONAL',   icon: Landmark,       colorVar: '--color-success' },
  topic:     { label: 'TOPIC TEST',  icon: Globe2,         colorVar: '--color-gold' },
  pyq:       { label: 'PYQ TEST',    icon: FileText,       colorVar: '--color-accent' },
};

function typeMeta(m) {
  const type = inferType(m);
  // subject-based icon override for a bit more personality
  if (/environ/i.test(m.subj)) return { ...TYPE_META[type], icon: Leaf };
  if (/english/i.test(m.subj)) return { ...TYPE_META[type], icon: BookOpen };
  return TYPE_META[type];
}

function AttemptCount({ count }) {
  return (
    <span className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>
      {count ? `${count.toLocaleString()} attempts` : 'No attempts yet'}
    </span>
  );
}

const EMPTY_FILTERS = { search: '', subject: 'all', types: new Set(), difficulties: new Set(), duration: 'all' };

export default function MockTestsPage() {
  const [tab, setTab] = useState('CSE Prelims');
  const [favorites, setFavorites] = useState(() => new Set());
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { data: liveMocks, isMock } = useFirestoreCollection({
    name: 'mockTests',
    orderBy: ['createdAt', 'desc'],
    limit: 200,
    fallback: ALL_MOCKS,
    transform: (docs) => docs.map(toMock),
  });

  const examMocks = useMemo(() => liveMocks.filter(m => m.exam === tab), [liveMocks, tab]);
  const totalAvailable = liveMocks.length;

  const subjects = useMemo(
    () => Array.from(new Set(examMocks.map(m => m.subj))).sort(),
    [examMocks]
  );

  const list = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return examMocks.filter(m => {
      if (q && !`${m.name} ${m.subj}`.toLowerCase().includes(q)) return false;
      if (filters.subject !== 'all' && m.subj !== filters.subject) return false;
      if (filters.types.size && !filters.types.has(inferType(m))) return false;
      if (filters.difficulties.size && !filters.difficulties.has(m.level)) return false;
      if (filters.duration !== 'all') {
        const bucket = DURATION_BUCKETS.find(b => b.key === filters.duration);
        if (bucket && !bucket.test(m.time)) return false;
      }
      return true;
    });
  }, [examMocks, filters]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSetFilter = (key, value) => {
    setFilters(prev => {
      const next = new Set(prev[key]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [key]: next };
    });
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <StudentLayout title="Mock Tests" subtitle="Calibrated to the real exam — honest analytics, no vanity scores.">
      {isMock && (
        <div className="mb-4 flex items-center gap-2 chip chip-amber" data-testid="mock-data-source">
          <Database size={11} strokeWidth={1.75} />
          Showing sample mocks · Create tests from Admin → Mock Tests to see live data here
        </div>
      )}

      {/* Exam tabs */}
      <div className="mt-8 flex items-center gap-2 flex-wrap" data-testid="mock-tabs">
        {EXAM_TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); clearFilters(); }}
                  className="px-4 py-2 rounded-full text-[13px]"
                  style={{
                    border: `1px solid ${tab === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: tab === t ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: tab === t ? '#fff' : 'var(--color-ink)',
                    fontWeight: 600,
                    transition: 'background-color .15s, color .15s, border-color .15s'
                  }}>{t}</button>
        ))}
 
      </div>

      {/* Filters + grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        {/* Sidebar filters */}
        <aside className="card p-5" data-testid="mock-filters">
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif text-[16px]">Filters</span>
            <button onClick={clearFilters} className="text-[12px] font-semibold" style={{ color: 'var(--color-primary)' }}>
              Clear All
            </button>
          </div>

          <div className="mb-5">
            <label className="eyebrow block mb-2">Search in results</label>
            <div className="relative">
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-faint)' }} />
              <input
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search tests..."
                className="w-full text-[13px] rounded-lg"
                style={{ padding: '0.5rem 0.6rem 0.5rem 1.8rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="eyebrow block mb-2">Subject</label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full text-[13px] rounded-lg"
              style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              <option value="all">All Subjects</option>
              {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>

          <div className="mb-5">
            <label className="eyebrow block mb-2">Test Type</label>
            <div className="flex flex-col gap-2">
              {TEST_TYPES.map(t => (
                <label key={t.key} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-ink)' }}>
                  <input
                    type="checkbox"
                    checked={filters.types.has(t.key)}
                    onChange={() => toggleSetFilter('types', t.key)}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="eyebrow block mb-2">Difficulty</label>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTIES.map(d => {
                const active = filters.difficulties.has(d);
                return (
                  <button key={d} onClick={() => toggleSetFilter('difficulties', d)}
                          className="px-3 py-1.5 rounded-full text-[12px]"
                          style={{
                            border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: active ? '#fff' : 'var(--color-ink)',
                            fontWeight: 600,
                          }}>{d}</button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="eyebrow block mb-2">Duration</label>
            <select
              value={filters.duration}
              onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full text-[13px] rounded-lg"
              style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              {DURATION_BUCKETS.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
          </div>
        </aside>

        {/* Test grid */}
        <div>
          {list.length === 0 ? (
            <div className="card p-8 text-center text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
              No tests match these filters. Try clearing a few.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {list.map((m, i) => {
                const meta = typeMeta(m);
                const Icon = meta.icon;
                const color = `var(${meta.colorVar})`;
                const isFav = favorites.has(m.id);
                return (
                  <motion.div key={m.id || m.name}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .3, delay: i * 0.03 }}
                    className="card card-hover p-4"
                    data-testid={`mock-card-${i}`}>

                    <div className="flex items-start justify-between">
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `color-mix(in srgb, ${color} 14%, transparent)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={16} strokeWidth={1.75} style={{ color }} />
                      </div>
                      <button
                        onClick={() => toggleFavorite(m.id)}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        style={{ color: isFav ? 'var(--color-gold)' : 'var(--color-ink-faint)' }}
                        className="p-1">
                        <Star size={14} strokeWidth={1.75} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="mt-2 text-[9.5px] font-mono font-bold" style={{ color, letterSpacing: '0.07em' }}>
                      {meta.label}
                    </div>

                    <div className="mt-1.5 font-serif text-[15.5px] leading-snug" style={{ letterSpacing: '-0.01em' }}>{m.name}</div>
                    <div className="mt-0.5 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>{m.subj}</div>

                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      <MiniStat label="Qs" val={m.qs} />
                      <MiniStat label="Marks" val={m.mks} />
                      <MiniStat label="Time" val={`${m.time}m`} />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <AttemptCount count={m.attempts} />
                      {m.reviews ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--color-ink)' }}>
                          <Star size={10} strokeWidth={0} fill="var(--color-gold)" />
                          {(m.rating ?? 0).toFixed(1)}
                        </span>
                      ) : (
                        <span className="chip" style={{ fontSize: 9.5 }}>New</span>
                      )}
                    </div>

                    <div className="mt-3 hairline-t pt-3 flex items-center justify-between">
                      <span className={`chip chip-${m.level === 'Hard' ? 'accent' : m.level === 'Medium' ? 'primary' : 'gold'}`} style={{ fontSize: 10.5 }}>
                        {m.level}
                      </span>
                      <button onClick={() => window.location.assign(`/student-desk/mock-tests/take/${encodeURIComponent(m.id || 'demo')}`)}
                              className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: 11.5, background: color, color: '#fff', border: 'none' }}
                              data-testid={`mock-start-${i}`}>
                        <Play size={11} fill="currentColor" /> Start test
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone, test }) {
  const color = tone === 'accent' ? 'var(--color-accent)' :
                tone === 'gold' ? 'var(--color-gold)' :
                tone === 'ink'  ? 'var(--color-ink-muted)' :
                'var(--color-primary)';
  return (
    <div className="card p-5 md:p-6" data-testid={test}>
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow">{label}</span>
        <Icon size={16} strokeWidth={1.5} style={{ color }} />
      </div>
      <div className="display-num text-[42px]" style={{ color }}>{value}</div>
      <div className="mt-1 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>{sub}</div>
    </div>
  );
}

function MiniStat({ label, val }) {
  return (
    <div className="p-1.5 rounded-md" style={{ background: 'var(--color-surface-alt)' }}>
      <div className="text-[8.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.1em' }}>{label.toUpperCase()}</div>
      <div className="font-serif text-[13.5px] mt-0.5">{val}</div>
    </div>
  );
}