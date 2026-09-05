import { useState, useMemo } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import {
  Clock, Download, Eye, FileText, Hash, Search, Target,
} from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';

const EXAMS = ['UPSC CSE Prelims', 'UPSC CSE Mains', 'UPSC CAPF', 'UPSC CDS', 'UPSC IFoS', 'UPSC ESE'];

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
  const [exam, setExam] = useState('All');
  const [year, setYear] = useState('All');
  const [q, setQ] = useState('');

  const { data: papers, isLoading, loaded } = useFirestoreCollection({
    name: 'pyqs',
    orderBy: ['year', 'desc'],
    limit: 200,
    transform: (docs) => docs.map(toPaper),
  });

  const years = useMemo(() => {
    const fromData = papers.map((p) => p.year).filter(Boolean);
    return Array.from(new Set(fromData)).sort((a, b) => Number(b) - Number(a));
  }, [papers]);

  const filtered = useMemo(() => papers.filter((p) =>
    (exam === 'All' || p.exam === exam)
    && (year === 'All' || String(p.year) === year)
    && (q.trim() === '' || (p.paper || '').toLowerCase().includes(q.toLowerCase())
      || (p.exam || '').toLowerCase().includes(q.toLowerCase())),
  ), [papers, exam, year, q]);

  const activeFilterLabel = `${exam} · ${year}`;

  return (
    <StudentLayout title="Previous Year Papers" plainHeader>
      <div className="pyq-desk">
        <div className="pyq-panel">
          <label className="pyq-search">
            <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by paper or exam…"
              data-testid="pyq-search"
            />
          </label>

          <div className="pyq-filter-group">
            <span className="pyq-filter-label">Exam</span>
            <div className="pyq-pills">
              {['All', ...EXAMS].map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setExam(e)}
                  className={`pyq-pill ${exam === e ? 'is-active' : ''}`}
                  data-testid={`pyq-exam-${e.replace(/\s/g, '')}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {years.length > 0 && (
            <div className="pyq-filter-group">
              <span className="pyq-filter-label">Year</span>
              <div className="pyq-pills">
                {['All', ...years].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setYear(y)}
                    className={`pyq-pill pyq-pill--year ${year === y ? 'is-active' : ''}`}
                    data-testid={`pyq-year-${y}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="pyq-empty">
            <p className="pyq-empty__text">Loading papers…</p>
          </div>
        ) : loaded && papers.length === 0 ? (
          <div className="pyq-empty">
            <FileText size={28} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)', margin: '0 auto 12px' }} />
            <h3 className="pyq-empty__title">No PYQ papers yet</h3>
            <p className="pyq-empty__text">
              Upload previous year papers from Admin → PYQ Papers and they will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="pyq-results-bar">
              <div className="pyq-results-bar__count" data-testid="pyq-list">
                {filtered.length} paper{filtered.length !== 1 ? 's' : ''}
              </div>
              <div className="pyq-results-bar__filters">{activeFilterLabel}</div>
            </div>

            <div className="pyq-grid">
              {filtered.map((p, i) => (
                <article key={p.id || i} className="pyq-card" data-testid={`pyq-row-${i}`}>
                  <div className="pyq-card__top">
                    <span className="pyq-card__year">{p.year || '—'}</span>
                    <span className="pyq-card__exam">{p.exam}</span>
                  </div>
                  <h3 className="pyq-card__title">{p.paper}</h3>
                  <div className="pyq-card__meta">
                    <span><Hash size={13} /> {p.qs || '—'} questions</span>
                    <span><Target size={13} /> {p.mks || '—'} marks</span>
                    <span><Clock size={13} /> {p.dur}</span>
                  </div>
                  <div className="pyq-card__actions">
                    {p.pdfUrl ? (
                      <>
                        <a
                          href={p.pdfUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="pyq-card__btn pyq-card__btn--ghost"
                          data-testid={`pyq-view-${i}`}
                        >
                          <Eye size={14} /> View
                        </a>
                        <a
                          href={p.pdfUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          download
                          className="pyq-card__btn pyq-card__btn--primary"
                          data-testid={`pyq-download-${i}`}
                        >
                          <Download size={14} /> PDF
                        </a>
                      </>
                    ) : (
                      <span className="text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
                        PDF not uploaded yet
                      </span>
                    )}
                  </div>
                </article>
              ))}

              {filtered.length === 0 && (
                <div className="pyq-empty">
                  <FileText size={28} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)', margin: '0 auto 12px' }} />
                  <h3 className="pyq-empty__title">No papers match</h3>
                  <p className="pyq-empty__text">
                    Try a different exam or year, or clear your search.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        <p className="pyq-footnote">
          Tip: start with Prelims GS papers from the last 5 years, then move to CSAT once your basics are strong.
        </p>
      </div>
    </StudentLayout>
  );
}
