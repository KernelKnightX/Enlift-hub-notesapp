import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import StudentLayout from '@/layouts/StudentLayout';
import useMistakes from '@/hooks/student/useMistakes';
import { recordMistakeReview } from '@/lib/weaknessMastery';
import { useAuth } from '@/contexts/AuthContext';

export default function MistakeReviewPage() {
  const { user } = useAuth();
  const { dueToday, loading } = useMistakes();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const sessionTotalRef = useRef(0);

  useEffect(() => {
    if (!loading && dueToday.length > 0 && sessionTotalRef.current === 0) {
      sessionTotalRef.current = dueToday.length;
    }
  }, [loading, dueToday.length]);

  const current = dueToday[index];
  const sessionTotal = sessionTotalRef.current || dueToday.length;
  const finished = !loading && sessionTotal > 0 && index >= sessionTotal;

  const handleReview = async (gotItRight) => {
    if (!user?.uid || !current || busy) return;
    setBusy(true);
    try {
      await recordMistakeReview(user.uid, current.id, gotItRight);
      setShowAnswer(false);
      setIndex((i) => i + 1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <StudentLayout
      title="Spaced mistake review"
      subtitle="Review mistakes due today — intervals: 1, 3, 7, 14, 30 days."
    >
      <Link
        href="/student-desk/mistake-notebook"
        className="text-[13px] flex items-center gap-1.5 mb-6"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <ArrowLeft size={14} /> Back to notebook
      </Link>

      {loading ? (
        <div className="card p-8 text-center text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
          Loading…
        </div>
      ) : dueToday.length === 0 ? (
        <div className="card p-10 text-center">
          <RotateCcw size={32} strokeWidth={1.4} style={{ color: 'var(--color-primary)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">All clear for today</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            No mistakes are due for spaced revision right now.
          </p>
        </div>
      ) : finished ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-10 text-center"
        >
          <CheckCircle2 size={36} style={{ color: 'var(--color-success)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">Session complete</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            You reviewed {sessionTotal} mistake{sessionTotal === 1 ? '' : 's'} today.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 md:p-8 max-w-[800px]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="eyebrow">
              {current.subject} · {current.topic}
            </span>
            <span className="text-[12px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>
              {index + 1} / {dueToday.length}
            </span>
          </div>

          <h2 className="font-serif text-[22px] leading-snug" style={{ letterSpacing: '-0.02em' }}>
            {current.question}
          </h2>

          <div
            className="mt-4 px-4 py-3 rounded-xl text-[14px]"
            style={{ background: 'var(--cat-pink-t)', border: '1px solid rgba(236,72,153,0.2)' }}
          >
            Your answer: <strong>{current.studentAnswer}</strong>
          </div>

          {!showAnswer ? (
            <button
              type="button"
              className="btn btn-ghost mt-6"
              onClick={() => setShowAnswer(true)}
            >
              Reveal correct answer
            </button>
          ) : (
            <div className="mt-6">
              <div
                className="px-4 py-3 rounded-xl text-[14px]"
                style={{ background: 'var(--cat-green-t)', border: '1px solid rgba(5,150,105,0.2)' }}
              >
                Correct: <strong>{current.correctAnswer}</strong>
              </div>
              {current.explanation && (
                <div
                  className="mt-3 text-[13px] p-3 rounded-lg leading-relaxed"
                  style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
                >
                  {current.explanation}
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => handleReview(true)}
                >
                  <CheckCircle2 size={14} /> Got it right
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => handleReview(false)}
                >
                  <XCircle size={14} /> Still wrong — reset interval
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </StudentLayout>
  );
}
