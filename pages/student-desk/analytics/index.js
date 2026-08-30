import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Target,
  Plus,
  BookOpen,
} from 'lucide-react';
import StudentLayout from '@/layouts/StudentLayout';
import useTopicStats from '@/hooks/student/useTopicStats';
import { useAuth } from '@/contexts/AuthContext';
import { addTopicToPlanQueue, buildTopicId } from '@/lib/weaknessMastery';

function AccuracyBar({ pct }) {
  const value = Number(pct) || 0;
  const tone =
    value < 40 ? 'var(--color-accent)' : value < 60 ? 'var(--color-gold)' : 'var(--color-primary)';

  return (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div
        className="h-2 flex-1 rounded-full overflow-hidden"
        style={{ background: 'var(--color-primary-tint)' }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background: tone,
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <span className="display-num text-[15px] shrink-0" style={{ color: tone }}>
        {value}%
      </span>
    </div>
  );
}

function TopicRow({ topic, userId, filterTopic }) {
  const [adding, setAdding] = useState(false);
  const topicId = topic.topicId || topic.id || buildTopicId(topic.subject, topic.topic);

  const handleAddToPlan = async () => {
    if (!userId || adding) return;
    setAdding(true);
    try {
      await addTopicToPlanQueue(userId, {
        subject: topic.subject,
        topic: topic.topic,
        topicId,
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 hairline-t"
      data-testid={`topic-${topicId}`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium">{topic.topic}</div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
          {topic.totalAttempts || 0} attempts · {topic.correctAttempts || 0} correct
        </div>
      </div>
      <AccuracyBar pct={topic.accuracyPct} />
      <div className="flex gap-2 shrink-0">
        <Link
          href={`/student-desk/mistake-notebook?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.topic)}`}
          className="text-[12px] font-medium px-3 py-2 rounded-lg"
          style={{ color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}
        >
          Review mistakes
        </Link>
        <button
          type="button"
          onClick={handleAddToPlan}
          disabled={adding}
          className="text-[12px] font-medium px-3 py-2 rounded-lg flex items-center gap-1"
          style={{
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
          }}
        >
          <Plus size={12} /> {adding ? 'Added…' : 'Add to plan'}
        </button>
      </div>
    </div>
  );
}

function SubjectBlock({ subject, topics, userId, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const avg =
    topics.length
      ? Math.round(topics.reduce((s, t) => s + Number(t.accuracyPct || 0), 0) / topics.length)
      : 0;

  return (
    <div className="card p-5 md:p-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
      >
        {open ? (
          <ChevronDown size={18} style={{ color: 'var(--color-ink-muted)' }} />
        ) : (
          <ChevronRight size={18} style={{ color: 'var(--color-ink-muted)' }} />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-serif text-[20px]" style={{ letterSpacing: '-0.02em' }}>
            {subject}
          </div>
          <div className="text-[12px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            {topics.length} topic{topics.length === 1 ? '' : 's'} tracked · avg {avg}%
          </div>
        </div>
        <AccuracyBar pct={avg} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            {topics.map((t) => (
              <TopicRow key={t.id || t.topicId} topic={t} userId={userId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { bySubject, weakCount, loading, topics } = useTopicStats();

  const subjects = Object.keys(bySubject).sort();

  return (
    <StudentLayout
      title="Weakness Analyzer"
      subtitle="Topic accuracy from your mock attempts — sorted by lowest first."
    >
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 md:col-span-4 card p-5"
        >
          <span className="eyebrow">Weak topics</span>
          <div className="display-num text-[42px] mt-2">{weakCount}</div>
          <p className="text-[12px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>
            Below 50% accuracy
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-12 md:col-span-8 card p-5 flex items-center gap-4"
        >
          <Target size={28} strokeWidth={1.4} style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="font-serif text-[18px]">Connected to your study plan</div>
            <p className="text-[13px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>
              Use &quot;Add to plan&quot; to queue weak topics for tomorrow&apos;s generated plan.
              Mistakes auto-sync from mock tests.
            </p>
          </div>
        </motion.div>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
          Loading…
        </div>
      ) : topics.length === 0 ? (
        <div className="card p-10 text-center">
          <BookOpen size={32} style={{ color: 'var(--color-ink-faint)', margin: '0 auto' }} />
          <p className="mt-4 font-serif text-[22px]">No topic data yet</p>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            Complete a mock test to populate accuracy by subject and topic.
          </p>
          <Link href="/student-desk/mock-tests" className="btn btn-primary mt-6 inline-flex">
            Attempt a mock
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subjects.map((subject, i) => (
            <SubjectBlock
              key={subject}
              subject={subject}
              topics={bySubject[subject]}
              userId={user?.uid}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
