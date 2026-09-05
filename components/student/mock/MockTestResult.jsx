import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Trophy, CheckCircle2, XCircle, Circle, RotateCcw, Home,
  Clock, TrendingUp, TrendingDown, Filter,
} from 'lucide-react';
import { formatDuration, formatMarks } from '@/lib/mockTestScoring';

const REVIEW_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'wrong', label: 'Wrong' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'skipped', label: 'Skipped' },
];

export default function MockTestResult({
  test,
  stats,
  answers,
  flagged = {},
  timeTakenSeconds = 0,
  submitReason = 'manual',
  previousAttemptPct = null,
  readOnly = false,
  onRetry,
}) {
  const [reviewFilter, setReviewFilter] = useState('all');

  const improvement = useMemo(() => {
    if (previousAttemptPct == null) return null;
    return Math.round((stats.scorePct - previousAttemptPct) * 10) / 10;
  }, [stats.scorePct, previousAttemptPct]);

  const filteredQuestions = useMemo(() => {
    return test.questions
      .map((qq, index) => ({ qq, index }))
      .filter(({ qq }) => {
        const chosen = answers[qq.id];
        const isCorrect = chosen === qq.correctAnswer;
        const isWrong = chosen !== undefined && !isCorrect;
        const isSkipped = chosen === undefined;
        const isFlagged = !!flagged[qq.id];

        if (reviewFilter === 'wrong') return isWrong;
        if (reviewFilter === 'flagged') return isFlagged;
        if (reviewFilter === 'skipped') return isSkipped;
        return true;
      });
  }, [test.questions, answers, flagged, reviewFilter]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} data-testid="test-result">
      <div className="grad-ink-glow" style={{ color: '#fff' }}>
        <div className="max-w-[960px] mx-auto px-6 md:px-10 py-10">
          {!readOnly ? (
            <Link href="/student-desk/mock-tests" className="text-[13px] flex items-center gap-1.5" style={{ color: '#B7BFB8' }}>
              <ArrowLeft size={14} /> Back to mocks
            </Link>
          ) : null}

          {submitReason === 'timeout' ? (
            <div className="mock-timeout-banner mt-6">
              Time&apos;s up — your test was auto-submitted.
            </div>
          ) : null}

          <div className="mt-8 flex items-center gap-3">
            <Trophy size={22} strokeWidth={1.6} style={{ color: '#F59E0B' }} />
            <span className="eyebrow" style={{ color: '#B7BFB8' }}>
              {readOnly ? 'Past attempt' : 'Result'} · {test.subject}
            </span>
          </div>

          <h1 className="mt-4 hero-display" style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.035em', color: '#fff' }}>
            <span className="grad-text">{formatMarks(stats.obtainedMarks)}</span>
            <span style={{ fontSize: '0.55em', color: '#B7BFB8' }}> / {formatMarks(stats.maxMarks)} marks</span>
          </h1>

          <p className="mt-3 text-[15px]" style={{ color: '#B7BFB8' }}>
            {stats.scorePct}% score · {stats.correct} correct · {stats.wrong} wrong · {stats.unanswered} skipped · {stats.total} total
          </p>

          <div className="mock-result-meta mt-4">
            <span><Clock size={13} /> Time taken: {formatDuration(timeTakenSeconds)}</span>
            {improvement != null ? (
              <span className={improvement >= 0 ? 'mock-result-meta--up' : 'mock-result-meta--down'}>
                {improvement >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {improvement >= 0 ? '+' : ''}{improvement}% vs last attempt ({previousAttemptPct}%)
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatTile label="Marks" value={`${formatMarks(stats.obtainedMarks)}/${formatMarks(stats.maxMarks)}`} tone="primary" />
          <StatTile label="Correct" value={stats.correct} tone="green" />
          <StatTile label="Wrong" value={stats.wrong} tone="pink" />
          <StatTile label="Skipped" value={stats.unanswered} tone="amber" />
        </div>

        {stats.subjectBreakdown?.length > 0 ? (
          <div className="card p-5 mb-8" data-testid="subject-breakdown">
            <div className="eyebrow mb-4">Subject-wise breakdown</div>
            <div className="mock-subject-grid">
              {stats.subjectBreakdown.map((row) => {
                const pct = row.maxMarks > 0
                  ? Math.round((row.obtainedMarks / row.maxMarks) * 100)
                  : 0;
                return (
                  <div key={row.subject} className="mock-subject-row">
                    <div className="mock-subject-row__head">
                      <span className="mock-subject-row__name">{row.subject}</span>
                      <span className="mock-subject-row__marks">
                        {formatMarks(row.obtainedMarks)}/{formatMarks(row.maxMarks)}
                      </span>
                    </div>
                    <div className="mock-subject-row__bar">
                      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                    </div>
                    <div className="mock-subject-row__detail">
                      {row.correct}✓ · {row.wrong}✗ · {row.unanswered} skipped
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="eyebrow">Review your answers</div>
          <div className="mock-review-filters" data-testid="review-filters">
            <Filter size={13} style={{ color: 'var(--color-ink-faint)' }} />
            {REVIEW_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`mock-review-filter${reviewFilter === f.key ? ' is-active' : ''}`}
                onClick={() => setReviewFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3" data-testid="test-review">
          {filteredQuestions.length === 0 ? (
            <div className="card p-6 text-center text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
              No questions match this filter.
            </div>
          ) : (
            filteredQuestions.map(({ qq, index }) => {
              const a = answers[qq.id];
              const correct = a === qq.correctAnswer;
              const chosen = a !== undefined;
              return (
                <div key={qq.id} className="card p-5" data-testid={`review-q-${index}`}>
                  <div className="flex items-start gap-3">
                    {!chosen ? (
                      <Circle size={18} strokeWidth={1.5} style={{ color: 'var(--color-ink-faint)', marginTop: 2 }} />
                    ) : correct ? (
                      <CheckCircle2 size={18} strokeWidth={1.6} style={{ color: 'var(--color-success)', marginTop: 2 }} />
                    ) : (
                      <XCircle size={18} strokeWidth={1.6} style={{ color: 'var(--color-danger)', marginTop: 2 }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>
                          Q{index + 1} / {test.questions.length}
                        </span>
                        {qq.subject ? (
                          <span className="chip chip-primary" style={{ fontSize: 10 }}>{qq.subject}</span>
                        ) : null}
                        {flagged[qq.id] ? (
                          <span className="chip chip-gold" style={{ fontSize: 10 }}>Flagged</span>
                        ) : null}
                      </div>
                      <div className="text-[15px] font-semibold" style={{ letterSpacing: '-0.005em' }}>{qq.question}</div>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {qq.options.map((op, k) => {
                          const isCorrect = k === qq.correctAnswer;
                          const isChosen = a === k;
                          return (
                            <li
                              key={k}
                              className="text-[13.5px] px-3 py-2 rounded-lg"
                              style={{
                                background: isCorrect ? 'var(--cat-green-t)' : isChosen ? 'var(--cat-pink-t)' : 'transparent',
                                border: `1px solid ${isCorrect ? 'rgba(5,150,105,0.35)' : isChosen ? 'rgba(236,72,153,0.35)' : 'var(--color-border)'}`,
                                color: isCorrect ? 'var(--cat-green)' : isChosen ? 'var(--cat-pink)' : 'var(--color-ink)',
                                fontWeight: isCorrect || isChosen ? 600 : 500,
                              }}
                            >
                              <span className="font-mono mr-2">{'ABCD'[k]}.</span>
                              {op}
                            </li>
                          );
                        })}
                      </ul>
                      {qq.explanation ? (
                        <div className="mt-3 text-[13px] p-3 rounded-lg" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}>
                          <b>Solution.</b> {qq.explanation}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!readOnly ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {stats.wrong > 0 ? (
              <Link href="/student-desk/analytics?tab=mistakes" className="btn btn-accent" data-testid="view-mistakes">
                <XCircle size={14} /> Review {stats.wrong} mistake{stats.wrong === 1 ? '' : 's'}
              </Link>
            ) : null}
            {onRetry ? (
              <button type="button" onClick={onRetry} className="btn btn-ghost" data-testid="retry-test">
                <RotateCcw size={14} /> Retry test
              </button>
            ) : null}
            <Link href="/student-desk/mock-tests" className="btn btn-primary" data-testid="back-to-mocks">
              <Home size={14} /> Back to mocks
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <Link href="/student-desk/mock-tests" className="btn btn-primary" data-testid="back-to-mocks">
              <Home size={14} /> Back to mocks
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value, tone }) {
  const map = {
    primary: { bg: 'var(--color-primary-tint)', fg: 'var(--color-primary)' },
    green: { bg: 'var(--cat-green-t)', fg: 'var(--cat-green)' },
    pink: { bg: 'var(--cat-pink-t)', fg: 'var(--cat-pink)' },
    amber: { bg: 'var(--cat-amber-t)', fg: '#B45309' },
  }[tone] || {};

  return (
    <div className="card p-4">
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: map.bg,
          color: map.fg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Trophy size={15} strokeWidth={1.6} />
      </div>
      <div className="display-num text-[26px]" style={{ color: map.fg }}>{value}</div>
      <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>{label}</div>
    </div>
  );
}
