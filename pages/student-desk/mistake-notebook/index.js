import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Filter,
} from 'lucide-react';
import StudentLayout from '@/layouts/StudentLayout';
import useMistakes from '@/hooks/student/useMistakes';
import {
  markMistakeMastered,
  recordMistakeReview,
} from '@/lib/weaknessMastery';
import { useAuth } from '@/contexts/AuthContext';

function MistakeRow({ mistake, userId, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState(false);

  const handleMastered = async () => {
    if (!userId || busy) return;
    setBusy(true);
    try {
      await markMistakeMastered(userId, mistake.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5" data-testid={`mistake-${mistake.id}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 text-left"
      >
        {open ? (
          <ChevronDown size={16} style={{ color: 'var(--color-ink-muted)', marginTop: 2 }} />
        ) : (
          <ChevronRight size={16} style={{ color: 'var(--color-ink-muted)', marginTop: 2 }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-mono mb-1" style={{ color: 'var(--color-ink-faint)' }}>
            {mistake.subject} · {mistake.topic}
          </div>
          <div className="text-[15px] font-semibold leading-snug" style={{ letterSpacing: '-0.01em' }}>
            {mistake.question}
          </div>
          {!open && (
            <div className="mt-2 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
              Your answer: {mistake.studentAnswer}
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pl-7"
          >
            <div className="grid gap-2 text-[13px]">
              <div
                className="px-3 py-2 rounded-lg"
                style={{ background: 'var(--cat-pink-t)', border: '1px solid rgba(236,72,153,0.25)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--cat-pink)' }}>Your answer: </span>
                {mistake.studentAnswer}
              </div>
              <div
                className="px-3 py-2 rounded-lg"
                style={{ background: 'var(--cat-green-t)', border: '1px solid rgba(5,150,105,0.25)' }}
              >
                <span className="font-semibold" style={{ color: 'var(--cat-green)' }}>Correct: </span>
                {mistake.correctAnswer}
              </div>
            </div>
            {mistake.explanation && (
              <div
                className="mt-3 text-[13px] p-3 rounded-lg leading-relaxed"
                style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)' }}
              >
                <b>Explanation.</b> {mistake.explanation}
              </div>
            )}
            {mistake.status === 'active' && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={handleMastered}
                  style={{ fontSize: 12.5, padding: '0.5rem 1rem' }}
                >
                  <CheckCircle2 size={14} /> Mark as mastered
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MistakeNotebookPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mistakes, active, mastered, subjects, loading } = useMistakes();
  const [tab, setTab] = useState('active');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    if (!router.isReady) return;
    const qSubject = router.query.subject;
    if (typeof qSubject === 'string' && qSubject) {
      setSubjectFilter(qSubject);
      setTab('active');
    }
  }, [router.isReady, router.query.subject]);

  const filtered = useMemo(() => {
    const pool = tab === 'mastered' ? mastered : active;
    let list = subjectFilter === 'all' ? pool : pool.filter((m) => m.subject === subjectFilter);
    const qTopic = router.query.topic;
    if (typeof qTopic === 'string' && qTopic) {
      list = list.filter((m) => m.topic === qTopic);
    }
    return list;
  }, [tab, subjectFilter, active, mastered, router.query.topic]);

  const grouped = useMemo(() => {
    const map = {};
    for (const m of filtered) {
      const key = m.subject || 'Other';
      if (!map[key]) map[key] = {};
      const topic = m.topic || 'General';
      if (!map[key][topic]) map[key][topic] = [];
      map[key][topic].push(m);
    }
    return map;
  }, [filtered]);

  return (
    <StudentLayout
      title="Mistake Notebook"
      subtitle="Every wrong answer becomes a revision opportunity."
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {['active', 'mastered'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="chip"
              style={{
                background: tab === key ? 'var(--color-primary-tint)' : 'var(--color-surface-alt)',
                color: tab === key ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                border: tab === key ? '1px solid rgba(77,56,245,0.3)' : '1px solid var(--color-border)',
              }}
            >
              {key === 'active' ? 'Active' : 'Mastered'} ({key === 'active' ? active.length : mastered.length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Filter size={14} style={{ color: 'var(--color-ink-muted)' }} />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-[13px] px-3 py-2 rounded-lg"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <BookOpen size={32} strokeWidth={1.4} style={{ color: 'var(--color-ink-faint)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">No mistakes here yet</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            Wrong answers from mock tests are saved automatically.
          </p>
          <Link href="/student-desk/mock-tests" className="btn btn-primary mt-6 inline-flex">
            Attempt a mock
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).map(([subject, topics]) => (
            <section key={subject}>
              <h2 className="font-serif text-[24px] mb-4" style={{ letterSpacing: '-0.02em' }}>
                {subject}
              </h2>
              {Object.entries(topics).map(([topic, rows]) => (
                <div key={topic} className="mb-6">
                  <div className="eyebrow mb-3">{topic}</div>
                  <div className="flex flex-col gap-3">
                    {rows.map((m) => (
                      <MistakeRow key={m.id} mistake={m} userId={user?.uid} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
