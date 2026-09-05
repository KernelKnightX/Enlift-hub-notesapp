import { useState, useMemo } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { motion } from 'framer-motion';
import {
  Play, RotateCcw, Search,
  ClipboardList, Landmark, Globe2, FileText, Leaf, BookOpen, TrendingUp, TrendingDown,
} from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';
import useTestAttempts from '@/hooks/student/useTestAttempts';
import { useAuth } from '@/contexts/AuthContext';

const EXAM_TABS = ['CSE Prelims'];
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
  qs: num(d.questions?.length ?? d.questions ?? d.totalQuestions ?? d.qs, 0),
  mks: num(d.marks ?? d.totalMarks ?? d.mks, 0),
  time: num(d.duration ?? d.time, 60),
  level: s(d.difficulty, s(d.level, 'Medium')),
  exam: s(d.exam, s(d.examType, 'CSE Prelims')).replace(/^UPSC\s+/i, ''),
  type: d.type ? s(d.type) : undefined,
  isPremium: !!(d.isPremium || d.premium),
});

const TYPE_ORDER = ['full', 'sectional', 'topic', 'pyq'];

const TYPE_META = {
  full: { label: 'Full Length', icon: ClipboardList, colorVar: '--color-primary' },
  sectional: { label: 'Sectional', icon: Landmark, colorVar: '--color-success' },
  topic: { label: 'Topic-wise', icon: Globe2, colorVar: '--color-gold' },
  pyq: { label: 'Previous Year', icon: FileText, colorVar: '--color-accent' },
};

function inferType(m) {
  if (m.type && TYPE_META[m.type]) return m.type;
  const text = `${m.name} ${m.subj}`.toLowerCase();
  if (/pyq|previous year/.test(text)) return 'pyq';
  if (/full[-\s]?length/.test(text)) return 'full';
  if (/section|polity|economy|history|geography|english/.test(text)) return 'sectional';
  return 'topic';
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
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { data: liveMocks, isLoading, loaded } = useFirestoreCollection({
    name: 'mockTests',
    orderBy: ['createdAt', 'desc'],
    limit: 200,
    transform: (docs) => docs.map(toMock),
  });

  const { attemptsByTest } = useTestAttempts();

  const examMocks = useMemo(() => liveMocks.filter((m) => m.exam === tab), [liveMocks, tab]);

  const subjects = useMemo(
    () => Array.from(new Set(examMocks.map((m) => m.subj))).sort(),
    [examMocks],
  );

  const list = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return examMocks.filter((m) => {
      if (q && !`${m.name} ${m.subj}`.toLowerCase().includes(q)) return false;
      if (filters.subject !== 'all' && m.subj !== filters.subject) return false;
      if (filters.types.size && !filters.types.has(inferType(m))) return false;
      if (filters.difficulties.size && !filters.difficulties.has(m.level)) return false;
      if (filters.duration !== 'all') {
        const bucket = DURATION_BUCKETS.find((b) => b.key === filters.duration);
        if (bucket && !bucket.test(m.time)) return false;
      }
      return true;
    });
  }, [examMocks, filters]);

  const toggleSetFilter = (key, value) => {
    setFilters((prev) => {
      const next = new Set(prev[key]);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [key]: next };
    });
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const startTest = (mock) => {
    if (mock.isPremium && !user?.isPremium) {
      window.alert('This is a Plus mock. Ask the office to grant Plus on your student account.');
      return;
    }
    window.location.assign(`/student-desk/mock-tests/take/${encodeURIComponent(mock.id)}`);
  };

  const showEmpty = loaded && liveMocks.length === 0;
  const showFilteredEmpty = loaded && list.length === 0 && !showEmpty;

  return (
    <StudentLayout title="Mock Tests">
      <div className="mt-1 flex items-center gap-4 flex-wrap" data-testid="mock-tabs">
        {EXAM_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); clearFilters(); }}
            className="px-4 py-2 rounded-full text-[13px]"
            style={{
              border: `1px solid ${tab === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: tab === t ? 'var(--color-primary)' : 'var(--color-surface)',
              color: tab === t ? '#fff' : 'var(--color-ink)',
              fontWeight: 600,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="card p-8 mt-6 text-center text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
          Loading mock tests…
        </div>
      ) : showEmpty ? (
        <div className="card p-10 mt-6 text-center">
          <ClipboardList size={32} strokeWidth={1.4} style={{ color: 'var(--color-ink-faint)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">No mock tests yet</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            Tests published from Admin → Mock Tests will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            <strong style={{ color: 'var(--color-ink)' }}>{list.length}</strong> test{list.length === 1 ? '' : 's'}
          </div>

          <div className="card p-4 mt-4" data-testid="mock-filters">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <div className="min-w-[200px] flex-1">
                <label className="eyebrow block mb-2">Search</label>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  <Search size={14} style={{ color: 'var(--color-ink-faint)' }} />
                  <input
                    type="search"
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    placeholder="Search by name or subject…"
                    className="flex-1 text-[13px] bg-transparent outline-none"
                    data-testid="mock-search"
                  />
                </div>
              </div>

              <div style={{ minWidth: 160 }}>
                <label className="eyebrow block mb-2">Subject</label>
                <select
                  value={filters.subject}
                  onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full text-[13px] rounded-lg"
                  style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>

              <div>
                <label className="eyebrow block mb-2">Test Type</label>
                <div className="flex gap-2 flex-wrap">
                  {TEST_TYPES.map((t) => {
                    const active = filters.types.has(t.key);
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => toggleSetFilter('types', t.key)}
                        className="px-3 py-1.5 rounded-full text-[12px]"
                        style={{
                          border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                          color: active ? '#fff' : 'var(--color-ink)',
                          fontWeight: 600,
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="eyebrow block mb-2">Difficulty</label>
                <div className="flex gap-2 flex-wrap">
                  {DIFFICULTIES.map((d) => {
                    const active = filters.difficulties.has(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleSetFilter('difficulties', d)}
                        className="px-3 py-1.5 rounded-full text-[12px]"
                        style={{
                          border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                          color: active ? '#fff' : 'var(--color-ink)',
                          fontWeight: 600,
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ minWidth: 160 }}>
                <label className="eyebrow block mb-2">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters((prev) => ({ ...prev, duration: e.target.value }))}
                  className="w-full text-[13px] rounded-lg"
                  style={{ padding: '0.5rem 0.6rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
                >
                  {DURATION_BUCKETS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {showFilteredEmpty ? (
              <div className="card p-8 text-center text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
                No tests match these filters. Try clearing a few.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {list.map((m, i) => {
                  const meta = typeMeta(m);
                  const Icon = meta.icon;
                  const color = `var(${meta.colorVar})`;
                  const attempt = attemptsByTest[m.id];

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="card card-hover overflow-hidden"
                      style={{ padding: 0 }}
                      data-testid={`mock-card-${i}`}
                    >
                      <div style={{ height: 4, background: color }} />
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <span
                            className="chip"
                            style={{
                              background: `color-mix(in srgb, ${color} 14%, transparent)`,
                              color,
                              fontWeight: 700,
                              fontSize: 11.5,
                              border: 'none',
                            }}
                          >
                            {meta.label}
                          </span>
                          {m.isPremium ? <span className="chip chip-gold">Plus</span> : null}
                        </div>

                        <div className="mt-2 font-serif text-[16px] leading-snug" style={{ letterSpacing: '-0.01em' }}>{m.name}</div>
                        <div className="mt-0.5 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>{m.subj}</div>

                        <div className="mt-3 flex items-center gap-3 flex-wrap text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                          <span>Qs <strong style={{ color: 'var(--color-ink)' }}>{m.qs}</strong></span>
                          <span>Marks <strong style={{ color: 'var(--color-ink)' }}>{m.mks}</strong></span>
                          <span>{m.time}m</span>
                          <span
                            className={`chip chip-${m.level === 'Hard' ? 'accent' : m.level === 'Medium' ? 'primary' : 'gold'}`}
                            style={{ fontSize: 10.5, marginLeft: 'auto' }}
                          >
                            {m.level}
                          </span>
                        </div>

                        {attempt ? (
                          <>
                            <div className="mt-3 hairline-t pt-3 flex items-center justify-between">
                              <div>
                                <div className="text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>Last score</div>
                                <span
                                  className="chip"
                                  style={{
                                    marginTop: 4,
                                    fontWeight: 700,
                                    fontSize: 12.5,
                                    background: attempt.lastPct >= 50 ? 'var(--color-success-tint, #e6f6ee)' : 'var(--color-accent-tint, #fdeaea)',
                                    color: attempt.lastPct >= 50 ? 'var(--color-success)' : 'var(--color-accent)',
                                    border: 'none',
                                  }}
                                >
                                  {attempt.lastScore} / {attempt.lastTotal} ({Math.round(attempt.lastPct)}%)
                                </span>
                              </div>
                              {attempt.trend != null && (
                                <span
                                  className="flex items-center gap-1 text-[12px] font-semibold"
                                  style={{ color: attempt.trend >= 0 ? 'var(--color-success)' : 'var(--color-accent)' }}
                                >
                                  {attempt.trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                  {attempt.trend >= 0 ? '+' : ''}{attempt.trend}%
                                </span>
                              )}
                            </div>

                            <div className="mt-2 text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>
                              Attempted {attempt.count} time{attempt.count === 1 ? '' : 's'} · Last:{' '}
                              {attempt.lastDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>

                            <button
                              type="button"
                              onClick={() => startTest(m)}
                              className="btn w-full mt-3"
                              style={{ padding: '0.55rem 0.8rem', fontSize: 12.5, background: 'var(--color-primary-dark, #6d28d9)', color: '#fff', border: 'none' }}
                              data-testid={`mock-reattempt-${i}`}
                            >
                              <RotateCcw size={12} /> Reattempt
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startTest(m)}
                            className="btn w-full mt-4"
                            style={{ padding: '0.55rem 0.8rem', fontSize: 12.5, background: color, color: '#fff', border: 'none' }}
                            data-testid={`mock-start-${i}`}
                          >
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
        </>
      )}
    </StudentLayout>
  );
}
