import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Target } from 'lucide-react';
import useTopicStats from '@/hooks/student/useTopicStats';

export default function WeaknessSummaryCard() {
  const { weakest, weakCount, loading } = useTopicStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 md:col-span-6 card p-6 md:p-8"
      data-testid="weakness-summary-card"
    >
      <div className="flex items-center gap-2">
        <Target
          size={16}
          strokeWidth={1.6}
          style={{ color: 'var(--color-primary)' }}
        />
        <span className="eyebrow">Weakness analyzer</span>
      </div>

      {loading ? (
        <div
          className="mt-6 text-[14px]"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Loading…
        </div>
      ) : !weakest ? (
        <div
          className="mt-6 text-[15px]"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Attempt mocks to surface topic-level accuracy.
        </div>
      ) : (
        <>
          <div className="mt-5 font-serif text-[22px] leading-snug">
            Weakest topic:{' '}
            <span style={{ color: 'var(--color-primary)' }}>
              {weakest.topic}
            </span>
            <span
              className="display-num ml-2"
              style={{ fontSize: 28, color: 'var(--color-accent)' }}
            >
              {weakest.accuracyPct}%
            </span>
          </div>
          <p
            className="mt-2 text-[13px]"
            style={{ color: 'var(--color-ink-muted)' }}
          >
            {weakest.subject} · {weakCount} topic{weakCount === 1 ? '' : 's'}{' '}
            below 50% accuracy
          </p>
        </>
      )}

      <div className="hairline-t mt-6 pt-4">
        <Link
          href="/student-desk/analytics"
          className="text-[13px] font-medium flex items-center gap-1"
          style={{ color: 'var(--color-primary)' }}
        >
          Open weakness analyzer <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
