import { useState, useMemo } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { motion } from 'framer-motion';
import { Download, FileText, Filter, Search, Eye, ChevronRight, Sparkles, Database } from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';

const EXAMS = ['UPSC CSE Prelims', 'UPSC CSE Mains', 'UPSC CAPF', 'UPSC CDS', 'UPSC IFoS', 'UPSC ESE'];
const YEARS = ['2024','2023','2022','2021','2020','2019','2018','2017','2016','2015'];

const MOCK_PAPERS = [
  { id:'p1', year:'2024', exam:'UPSC CSE Prelims', paper:'General Studies I',   qs:100, mks:200, dur:'2 hours', pdfUrl:'/sample.pdf' },
  { id:'p2', year:'2024', exam:'UPSC CSE Prelims', paper:'CSAT',                qs:80,  mks:200, dur:'2 hours', pdfUrl:'/sample.pdf' },
  { id:'p3', year:'2024', exam:'UPSC CSE Mains',   paper:'Essay',               qs:2,   mks:250, dur:'3 hours', pdfUrl:'/sample.pdf' },
  { id:'p4', year:'2024', exam:'UPSC CSE Mains',   paper:'General Studies I',   qs:20,  mks:250, dur:'3 hours', pdfUrl:'/sample.pdf' },
  { id:'p5', year:'2024', exam:'UPSC CSE Mains',   paper:'General Studies II',  qs:20,  mks:250, dur:'3 hours', pdfUrl:'/sample.pdf' },
  { id:'p6', year:'2024', exam:'UPSC CSE Mains',   paper:'General Studies III', qs:20,  mks:250, dur:'3 hours', pdfUrl:'/sample.pdf' },
  { id:'p7', year:'2024', exam:'UPSC CSE Mains',   paper:'General Studies IV',  qs:12,  mks:250, dur:'3 hours', pdfUrl:'/sample.pdf' },
  { id:'p8', year:'2023', exam:'UPSC CSE Prelims', paper:'General Studies I',   qs:100, mks:200, dur:'2 hours', pdfUrl:'/sample.pdf' },
  { id:'p9', year:'2023', exam:'UPSC CSE Prelims', paper:'CSAT',                qs:80,  mks:200, dur:'2 hours', pdfUrl:'/sample.pdf' },
  { id:'p10',year:'2023', exam:'UPSC CAPF',        paper:'Paper I (GS)',        qs:125, mks:250, dur:'2 hours', pdfUrl:'/sample.pdf' },
  { id:'p11',year:'2023', exam:'UPSC CDS',         paper:'English',             qs:120, mks:100, dur:'2 hours', pdfUrl:'/sample.pdf' },
  { id:'p12',year:'2022', exam:'UPSC CSE Prelims', paper:'General Studies I',   qs:100, mks:200, dur:'2 hours', pdfUrl:'/sample.pdf' },
  { id:'p13',year:'2022', exam:'UPSC IFoS',        paper:'General English',     qs:8,   mks:300, dur:'3 hours', pdfUrl:'/sample.pdf' },
  { id:'p14',year:'2021', exam:'UPSC ESE',         paper:'General Studies',     qs:100, mks:200, dur:'2 hours', pdfUrl:'/sample.pdf' },
];

const s = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return fallback;
};
const num = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };

const toPaper = (d) => ({
  id: d.id,
  year: String(s(d.year, s(d.examYear, ''))),
  exam: s(d.exam, s(d.examType, 'UPSC CSE Prelims')),
  paper: s(d.paper, s(d.title, 'Paper')),
  qs: num(d.questions ?? d.qs ?? d.totalQuestions, 0),
  mks: num(d.marks ?? d.mks ?? d.totalMarks, 0),
  dur: s(d.duration, s(d.dur, '2 hours')),
  pdfUrl: s(d.pdfUrl, s(d.url, '')),
});

export default function PYQPage() {
  const [exam, setExam] = useState('UPSC CSE Prelims');
  const [year, setYear] = useState('All');
  const [q, setQ] = useState('');

  const { data: papers, isMock } = useFirestoreCollection({
    name: 'pyqs',
    orderBy: ['year', 'desc'],
    limit: 200,
    fallback: MOCK_PAPERS,
    transform: (docs) => docs.map(toPaper),
  });

  const filtered = useMemo(() => papers.filter(p =>
    (exam === 'All' || p.exam === exam) &&
    (year === 'All' || String(p.year) === year) &&
    (q.trim() === '' || (p.paper||'').toLowerCase().includes(q.toLowerCase()))
  ), [papers, exam, year, q]);

  return (
    <StudentLayout title="Previous Year Papers" subtitle="Ten years of UPSC PYQs — filterable by exam and year.">
      {isMock && (
        <div className="mb-4 flex items-center gap-2 chip chip-amber" data-testid="pyq-data-source">
          <Database size={11} strokeWidth={1.75} />
          Showing sample papers · Upload PYQs from Admin → PYQ to see live data here
        </div>
      )}
      {/* Overview strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Years archived', v: '10' },
          { l: 'Papers indexed', v: papers.length + '+' },
          { l: 'Questions solved', v: '18,240' },
          { l: 'Filters supported', v: 'Exam · Year · Paper' },
        ].map(s => (
          <div key={s.l} className="card p-5 md:p-6" data-testid={`pyq-stat-${s.l.replace(/\s/g,'-').toLowerCase()}`}>
            <div className="eyebrow">{s.l}</div>
            <div className="display-num text-[38px] mt-2" style={{ color: 'var(--color-primary)' }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filter row */}
      <div className="mt-6 card p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 md:max-w-[360px]"
               style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-ink-muted)' }} />
            <input value={q} onChange={e => setQ(e.target.value)}
                   placeholder="Search papers…" data-testid="pyq-search"
                   className="bg-transparent outline-none text-[14px] flex-1" />
          </div>

          <div className="flex-1 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-mono mr-1" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.14em' }}>EXAM</span>
            {['All', ...EXAMS].slice(0, 5).map(e => (
              <button key={e} onClick={() => setExam(e)}
                      className="px-3 py-1.5 rounded-full text-[12px]"
                      data-testid={`pyq-exam-${e.replace(/\s/g,'')}`}
                      style={{
                        border: `1px solid ${exam === e ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: exam === e ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: exam === e ? 'var(--color-bg)' : 'var(--color-ink-muted)',
                        fontWeight: 600,
                        transition: 'background-color .15s, color .15s, border-color .15s'
                      }}>{e}</button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono mr-1" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.14em' }}>YEAR</span>
          {['All', ...YEARS].map(y => (
            <button key={y} onClick={() => setYear(y)}
                    className="px-3 py-1.5 rounded-full text-[12px]"
                    data-testid={`pyq-year-${y}`}
                    style={{
                      border: `1px solid ${year === y ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: year === y ? 'var(--color-accent-tint)' : 'var(--color-surface)',
                      color: year === y ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                      fontWeight: 600,
                      transition: 'background-color .15s, color .15s, border-color .15s'
                    }}>{y}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-6 card overflow-hidden" data-testid="pyq-list">
        <div className="hairline-b px-6 py-4 flex items-center justify-between">
          <div className="font-serif text-[19px]" style={{ letterSpacing: '-0.01em' }}>
            {filtered.length} paper{filtered.length !== 1 ? 's' : ''} found
          </div>
          <div className="text-[12px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>
            {exam} · {year}
          </div>
        </div>
        {filtered.map((p, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .3, delay: i * 0.02 }}
            className="p-5 md:p-6 flex items-center gap-5 group"
            style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}
            data-testid={`pyq-row-${i}`}
          >
            <div className="min-w-[60px] text-center">
              <div className="display-num text-[28px]" style={{ color: 'var(--color-primary)', lineHeight: 1 }}>{p.year}</div>
              <div className="text-[10px] font-mono mt-1" style={{ color: 'var(--color-ink-faint)' }}>YEAR</div>
            </div>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--color-border)' }} />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.12em' }}>{p.exam.toUpperCase()}</div>
              <div className="font-serif text-[18px] mt-0.5" style={{ letterSpacing: '-0.01em' }}>{p.paper}</div>
              <div className="mt-1.5 flex items-center gap-4 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
                <span>{p.qs} questions</span>
                <span>·</span>
                <span>{p.mks} marks</span>
                <span>·</span>
                <span>{p.dur}</span>
              </div>
            </div>
            {p.pdfUrl ? (
              <>
                <a href={p.pdfUrl} target="_blank" rel="noreferrer noopener"
                   className="btn btn-ghost" style={{ padding: '0.5rem 0.9rem', fontSize: 12 }} data-testid={`pyq-view-${i}`}>
                  <Eye size={14} strokeWidth={1.5} /> View
                </a>
                <a href={p.pdfUrl} target="_blank" rel="noreferrer noopener"
                   download
                   className="btn btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: 12 }} data-testid={`pyq-download-${i}`}>
                  <Download size={14} strokeWidth={1.6} /> PDF
                </a>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <button className="btn btn-ghost disabled" style={{ padding: '0.5rem 0.9rem', fontSize: 12, cursor: 'not-allowed' }} disabled>
                  <Eye size={14} strokeWidth={1.5} /> No view
                </button>
                <button className="btn btn-primary disabled" style={{ padding: '0.5rem 0.9rem', fontSize: 12, cursor: 'not-allowed' }} disabled>
                  <Download size={14} strokeWidth={1.6} /> No PDF
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom hint */}
      <div className="mt-6 card p-5 flex items-center gap-3"
           style={{ background: 'var(--color-primary-tint)', borderColor: 'transparent' }}>
        <Sparkles size={16} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
        <div className="text-[13.5px]" style={{ color: 'var(--color-primary)' }}>
          Plus members can view solved solutions, topic-wise question breakdowns and printable answer keys.
        </div>
      </div>
    </StudentLayout>
  );
}
