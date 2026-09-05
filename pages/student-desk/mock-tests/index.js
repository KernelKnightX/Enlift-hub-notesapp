// pages/student-desk/mock-tests/index.jsx
import { useState, useMemo } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { motion } from 'framer-motion';
import {
  Play, RotateCcw, Database, Search,
  ClipboardList, Landmark, Globe2, FileText, Star, Leaf, BookOpen, TrendingUp, TrendingDown
} from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';
import useTestAttempts from '@/hooks/student/useTestAttempts';
import { useAuth } from '@/contexts/AuthContext';

const EXAM_TABS = ['CSE Prelims', 'CSE Mains', 'CAPF', 'CDS', 'IFoS', 'ESE'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TEST_TYPES = [
  { key: 'full', label: 'Full Length' },
  { key: 'sectional', label: 'Sectional' },
  { key: 'topic', label: 'Topic-wise' },
  { key: 'pyq', label: 'Previous Year' },
];
const DURATION_BUCKETS = [
  { key: 'all', label: 'Any', test: () => true },
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
  type: d.type ? s(d.type) : undefined,
  rating: d.rating != null ? num(d.rating) : undefined,
  reviews: d.reviews != null ? num(d.reviews) : undefined,
  isPremium: !!(d.isPremium || d.premium),
});

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TYPE_ORDER = ['full', 'sectional', 'topic', 'pyq'];

const TYPE_META = {
  full:      { label: 'Full Length',   icon: ClipboardList, colorVar: '--color-primary' },
  sectional: { label: 'Sectional',     icon: Landmark,       colorVar: '--color-success' },
  topic:     { label: 'Topic-wise',    icon: Globe2,         colorVar: '--color-gold' },
  pyq:       { label: 'Previous Year', icon: FileText,       colorVar: '--color-accent' },
};

function inferType(m) {
  if (m.type && TYPE_META[m.type]) return m.type;
  const text = `${m.name} ${m.subj}`.toLowerCase();
  if (/pyq|previous year/.test(text)) return 'pyq';
  if (/full[-\s]?length/.test(text)) return 'full';
  if (/section|polity|economy|history|geography|english/.test(text)) return 'sectional';
  if (/essay|answer writing|topic/.test(text)) return 'topic';
  return TYPE_ORDER[hashStr(m.name || m.subj || 'x') % TYPE_ORDER.length];
}

function typeMeta(m) {
  const type = inferType(m);
  if (/environ/i.test(m.subj)) return { ...TYPE_META[type], icon: Leaf };
  if (/english/i.test(m.subj)) return { ...TYPE_META[type], icon: BookOpen };
  return TYPE_META[type];
}

const EMPTY_FILTERS = { search: '', subject: 'all', types: new Set(), difficulties: new Set(), duration: 'all' };

export default function MockTestsPage() {
  const { user } = useAuth();
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

  const { attemptsByTest } = useTestAttempts();

  const examMocks = useMemo(() => liveMocks.filter(m => m.exam === tab), [liveMocks, tab]);

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

  const clearFilters = () => {
    setFilters({
      search: '',
      subject: 'all',
      types: new Set(),
      difficulties: new Set(),
      duration: 'all',
    });
  };

  const startTest = (mock) => {
    if (mock.isPremium && !user?.isPremium) {
      window.alert('This is a Plus mock. Ask the office to grant Plus on your student account.');
      return;
    }
    window.location.assign(`/student-desk/mock-tests/take/${encodeURIComponent(mock.id || 'demo')}`);
  };

  return (
    <StudentLayout title="Mock Tests">
      {isMock && (
        <div className="mb-4 flex items-center gap-2 chip chip-amber" data-testid="mock-data-source">
          <Database size={11} strokeWidth={1.75} />
          Showing sample mocks · Create tests from Admin → Mock Tests to see live data here
        </div>
      )}

      {/* Exam tabs */}
      <div className="mt-1 flex items-center gap-4 flex-wrap" data-testid="mock-tabs">
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

      <div className="mt-6 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
        <strong style={{ color: 'var(--color-ink)' }}>{list.length}</strong> tests found
      </div>

      {/* Horizontal filter bar */}
      <div className="card p-4 mt-4" data-testid="mock-filters">
        <div className="flex items-center justify-between mb-4">
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">


          {/* Subject */}
          <div style={{ minWidth: 160 }}>
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

          {/* Test Type */}
          <div>
            <label className="eyebrow block mb-2">Test Type</label>
            <div className="flex gap-2 flex-wrap">
              {TEST_TYPES.map(t => {
                const active = filters.types.has(t.key);
                return (
                  <button key={t.key} onClick={() => toggleSetFilter('types', t.key)}
                          className="px-3 py-1.5 rounded-full text-[12px]"
                          style={{
                            border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: active ? '#fff' : 'var(--color-ink)',
                            fontWeight: 600,
                          }}>{t.label}</button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div>
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

          {/* Duration */}
          <div style={{ minWidth: 160 }}>
            <label className="eyebrow block mb-2">Duration</label>
            <select
              value={filters.duration}
              onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full text-[13px] rounded-lg"
              style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
              {DURATION_BUCKETS.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Test grid — full width now, no sidebar */}
      <div className="mt-6">
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
              const attempt = attemptsByTest[m.id];

              return (
                <motion.div key={m.id || m.name}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .3, delay: i * 0.03 }}
                  className="card card-hover overflow-hidden"
                  style={{ padding: 0 }}
                  data-testid={`mock-card-${i}`}>

                  <div style={{ height: 4, background: color }} />

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <span className="chip" style={{
                        background: `color-mix(in srgb, ${color} 14%, transparent)`,
                        color, fontWeight: 700, fontSize: 11.5, border: 'none'
                      }}>
                        {meta.label}
                      </span>
                      {m.isPremium ? <span className="chip chip-gold">Plus</span> : null}
                      <button
                        onClick={() => toggleFavorite(m.id)}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        style={{ color: isFav ? 'var(--color-gold)' : 'var(--color-ink-faint)' }}
                        className="p-1">
                        <Star size={14} strokeWidth={1.75} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="mt-2 font-serif text-[16px] leading-snug" style={{ letterSpacing: '-0.01em' }}>{m.name}</div>
                    <div className="mt-0.5 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>{m.subj}</div>

                    <div className="mt-3 flex items-center gap-3 flex-wrap text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                      <span>Qs <strong style={{ color: 'var(--color-ink)' }}>{m.qs}</strong></span>
                      <span>Marks <strong style={{ color: 'var(--color-ink)' }}>{m.mks}</strong></span>
                      <span>{m.time}m</span>
                      <span className={`chip chip-${m.level === 'Hard' ? 'accent' : m.level === 'Medium' ? 'primary' : 'gold'}`} style={{ fontSize: 10.5, marginLeft: 'auto' }}>
                        {m.level}
                      </span>
                    </div>

                    {attempt ? (
                      <>
                        <div className="mt-3 hairline-t pt-3 flex items-center justify-between">
                          <div>
                            <div className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>Last score</div>
                            <span className="chip" style={{
                              marginTop: 4, fontWeight: 700, fontSize: 12.5,
                              background: attempt.lastPct >= 50 ? 'var(--color-success-tint, #e6f6ee)' : 'var(--color-accent-tint, #fdeaea)',
                              color: attempt.lastPct >= 50 ? 'var(--color-success)' : 'var(--color-accent)',
                              border: 'none'
                            }}>
                              {attempt.lastScore} / {attempt.lastTotal} ({Math.round(attempt.lastPct)}%)
                            </span>
                          </div>
                          {attempt.trend != null && (
                            <span className="flex items-center gap-1 text-[12px] font-semibold"
                                  style={{ color: attempt.trend >= 0 ? 'var(--color-success)' : 'var(--color-accent)' }}>
                              {attempt.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                              {attempt.trend >= 0 ? '+' : ''}{attempt.trend}%
                            </span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: Math.min(attempt.count, 3) }).map((_, di) => (
                              <span key={di} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
                            ))}
                          </span>
                          Attempted {attempt.count} time{attempt.count === 1 ? '' : 's'} · Last: {attempt.lastDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>

                        <button onClick={() => startTest(m)}
                                className="btn w-full mt-3" style={{ padding: '0.55rem 0.8rem', fontSize: 12.5, background: 'var(--color-primary-dark, #6d28d9)', color: '#fff', border: 'none' }}
                                data-testid={`mock-reattempt-${i}`}>
                          <RotateCcw size={12} /> Reattempt
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startTest(m)}
                              className="btn w-full mt-4" style={{ padding: '0.55rem 0.8rem', fontSize: 12.5, background: color, color: '#fff', border: 'none' }}
                              data-testid={`mock-start-${i}`}>
                        <Play size={12} fill="currentColor" /> Start Test
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}