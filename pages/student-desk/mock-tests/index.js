import { useState, useMemo } from 'react';
import Link from 'next/link';
import StudentLayout from '../../../components/StudentLayout';
import { motion } from 'framer-motion';
import {
  Play, ClipboardCheck, TrendingUp, Timer, Target, ChevronRight,
  Filter, ArrowUpRight, Sparkles, BarChart3, CheckCircle2, Database
} from 'lucide-react';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';

const EXAM_TABS = ['CSE Prelims', 'CSE Mains', 'CAPF', 'CDS', 'IFoS', 'ESE'];

const MOCKS = {
  'CSE Prelims': [
    { id:'k1', name: 'Full-Length Mock #12', subj:'General Studies I', qs:100, mks:200, time:120, level:'Hard',   attempts:2412, exam:'CSE Prelims' },
    { id:'k2', name: 'Sectional: Polity',    subj:'Polity',           qs:25,  mks:50,  time:30,  level:'Medium', attempts:1204, exam:'CSE Prelims' },
    { id:'k3', name: 'Sectional: Economy',   subj:'Economy',          qs:25,  mks:50,  time:30,  level:'Medium', attempts:988,  exam:'CSE Prelims' },
    { id:'k4', name: 'Full-Length Mock #11', subj:'General Studies I', qs:100, mks:200, time:120, level:'Medium', attempts:3560, exam:'CSE Prelims' },
  ],
  'CSE Mains': [
    { id:'k5', name: 'Answer Writing: GS-II', subj:'GS-II',        qs:20, mks:250, time:180, level:'Hard',   attempts:812, exam:'CSE Mains' },
    { id:'k6', name: 'Essay Practice: Set 3',  subj:'Essay',       qs:2,  mks:250, time:180, level:'Medium', attempts:640, exam:'CSE Mains' },
  ],
  'CAPF':   [{ id:'k7', name:'CAPF Paper I Mock #4',  subj:'GS',        qs:125, mks:250, time:120, level:'Medium', attempts:604, exam:'CAPF' }],
  'CDS':    [{ id:'k8', name:'CDS English Mock #6',   subj:'English',   qs:120, mks:100, time:120, level:'Easy',   attempts:410, exam:'CDS' }],
  'IFoS':   [{ id:'k9', name:'IFoS General English',  subj:'English',   qs:8,   mks:300, time:180, level:'Medium', attempts:172, exam:'IFoS' }],
  'ESE':    [{ id:'k10',name:'ESE GS Mock #2',        subj:'GS',        qs:100, mks:200, time:120, level:'Hard',   attempts:302, exam:'ESE' }],
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
});

const RECENT = [
  { name:'Full-Length Mock #11', score:78, total:100, correct:78, wrong:18, skip:4, date:'22 Jan 2026' },
  { name:'Sectional: Polity',    score:64, total:100, correct:16, wrong:8, skip:1, date:'20 Jan 2026' },
  { name:'Full-Length Mock #10', score:72, total:100, correct:72, wrong:22, skip:6, date:'15 Jan 2026' },
];

export default function MockTestsPage() {
  const [tab, setTab] = useState('CSE Prelims');

  const { data: liveMocks, isMock } = useFirestoreCollection({
    name: 'mockTests',
    orderBy: ['createdAt', 'desc'],
    limit: 200,
    fallback: ALL_MOCKS,
    transform: (docs) => docs.map(toMock),
  });

  const list = useMemo(() => liveMocks.filter(m => m.exam === tab), [liveMocks, tab]);
  const totalAvailable = liveMocks.length;

  return (
    <StudentLayout title="Mock Tests" subtitle="Calibrated to the real exam — honest analytics, no vanity scores.">
      {isMock && (
        <div className="mb-4 flex items-center gap-2 chip chip-amber" data-testid="mock-data-source">
          <Database size={11} strokeWidth={1.75} />
          Showing sample mocks · Create tests from Admin → Mock Tests to see live data here
        </div>
      )}
      {/* Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total available"    value={totalAvailable ? String(totalAvailable) + '+' : '500+'} sub="Across 6 examinations" icon={ClipboardCheck} tone="primary" test="mock-total" />
        <StatCard label="You've attempted"   value="18"     sub="This cycle"            icon={CheckCircle2}   tone="accent"  test="mock-attempted" />
        <StatCard label="Average score"      value="72%"    sub="+4% vs last month"    icon={TrendingUp}     tone="gold"    test="mock-avg" />
        <StatCard label="Weakest topic"      value="Env"    sub="Environment — 58%"    icon={Target}         tone="ink"     test="mock-weak" />
      </div>

      {/* Exam tabs */}
      <div className="mt-8 flex items-center gap-2 flex-wrap" data-testid="mock-tabs">
        {EXAM_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-2 rounded-full text-[13px]"
                  style={{
                    border: `1px solid ${tab === t ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: tab === t ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: tab === t ? '#fff' : 'var(--color-ink)',
                    fontWeight: 600,
                    transition: 'background-color .15s, color .15s, border-color .15s'
                  }}>{t}</button>
        ))}
        <Link href="/student-desk/mock-tests/take/demo" className="btn btn-accent ml-auto"
              style={{ padding: '0.55rem 1rem', fontSize: 12.5 }} data-testid="try-demo">
          <Play size={13} fill="currentColor" /> Try a demo test
        </Link>
      </div>

      {/* Test grid */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {list.map((m, i) => (
              <motion.div key={m.name}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .3, delay: i * 0.04 }}
                className="card card-hover p-6"
                data-testid={`mock-card-${i}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="chip">{m.subj}</span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>{m.attempts.toLocaleString()} attempts</span>
                </div>
                <div className="font-serif text-[20px]" style={{ letterSpacing: '-0.01em' }}>{m.name}</div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <MiniStat label="Qs" val={m.qs} />
                  <MiniStat label="Marks" val={m.mks} />
                  <MiniStat label="Time" val={`${m.time}m`} />
                </div>
                <div className="mt-5 hairline-t pt-4 flex items-center justify-between">
                  <span className={`chip chip-${m.level === 'Hard' ? 'accent' : m.level === 'Medium' ? 'primary' : 'gold'}`}>
                    {m.level}
                  </span>
                  <button onClick={() => window.location.assign(`/student-desk/mock-tests/take/${encodeURIComponent(m.id || 'demo')}`)}
                          className="btn btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: 12.5 }} data-testid={`mock-start-${i}`}>
                    <Play size={13} fill="currentColor" /> Start test
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent history + analytics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6">
          <div className="card p-6" data-testid="mock-recent">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="eyebrow mb-1">Recent attempts</div>
                <div className="font-serif text-[19px]" style={{ letterSpacing: '-0.01em' }}>Your last three mocks</div>
              </div>
              <BarChart3 size={16} strokeWidth={1.5} style={{ color: 'var(--color-ink-muted)' }} />
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {RECENT.map((r, i) => (
                <div key={i} className="pb-4 hairline-b last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-[14.5px]">{r.name}</span>
                    <span className="display-num text-[19px]" style={{ color: r.score >= 70 ? 'var(--color-success)' : 'var(--color-accent)' }}>
                      {r.score}%
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {Array.from({ length: 10 }).map((_, k) => (
                      <div key={k} style={{
                        flex: 1, height: 4, borderRadius: 999,
                        background: k < Math.round(r.score / 10) ? 'var(--color-primary)' : 'var(--color-border)'
                      }} />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11.5px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>
                    <span>✓ {r.correct}</span>
                    <span>✕ {r.wrong}</span>
                    <span>◌ {r.skip}</span>
                    <span className="ml-auto">{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6" data-testid="mock-plus"
               style={{ background: 'var(--color-ink)', color: 'var(--color-bg)', borderColor: 'transparent' }}>
            <span className="chip" style={{ background: 'rgba(178,90,61,0.15)', color: '#E8A889', borderColor: 'rgba(178,90,61,0.35)' }}>
              <Sparkles size={11} /> Plus feature
            </span>
            <div className="mt-4 font-serif text-[19px]" style={{ letterSpacing: '-0.01em' }}>
              Weak-topic radar + AI review
            </div>
            <p className="mt-2 text-[13px]" style={{ color: '#B7BFB8' }}>
              After each mock, get a topic-wise breakdown and a suggested revision path — powered by rankers&apos; heuristics.
            </p>
            <button className="btn btn-accent mt-5" style={{ padding: '0.55rem 1.1rem', fontSize: 12.5 }} data-testid="mock-upgrade">
              Try 7 days free <ArrowUpRight size={13} />
            </button>
          </div>
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
    <div className="p-2.5 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
      <div className="text-[10px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>{label.toUpperCase()}</div>
      <div className="font-serif text-[17px] mt-0.5">{val}</div>
    </div>
  );
}
