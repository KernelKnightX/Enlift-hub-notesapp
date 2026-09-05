import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw } from 'lucide-react';
import useMistakes from '@/hooks/student/useMistakes';

export default function MistakesDueCard() {
  const { dueCount, loading } = useMistakes();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="col-span-12 md:col-span-6 card p-6 md:p-8"
      data-testid="mistakes-due-card"
    >
      <div className="flex items-center gap-2">
        <RotateCcw
          size={16}
          strokeWidth={1.6}
          style={{ color: 'var(--color-accent)' }}
        />
        <span className="eyebrow">Mistakes due for revision</span>
      </div>

      {loading ? (
        <div
          className="mt-6 text-[14px]"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Loading…
        </div>
      ) : dueCount === 0 ? (
        <div
          className="mt-6 text-[15px]"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          No mistakes due today. Attempt a mock to build your notebook.
        </div>
      ) : (
        <>
          <div className="mt-5 font-serif text-[25px] leading-tight">
            <span
              className="display-num"
              style={{ color: 'var(--color-accent)', fontSize: 38 }}
            >
              {dueCount}
            </span>{' '}
            mistake{dueCount === 1 ? '' : 's'} ready for spaced review
          </div>
          <p
            className="mt-3 text-[13px] leading-relaxed"
            style={{ color: 'var(--color-ink-muted)' }}
          >
            Review wrong answers before they fade — intervals run 1, 3, 7, 14,
            and 30 days.
          </p>
        </>
      )}

      <div className="hairline-t mt-6 pt-4 flex flex-wrap gap-4">
        <Link
          href="/student-desk/analytics/review"
          className="text-[13px] font-medium flex items-center gap-1"
          style={{ color: 'var(--color-primary)' }}
        >
          Quick review <ArrowRight size={14} />
        </Link>
        <Link
          href="/student-desk/analytics?tab=mistakes"
          className="text-[13px] font-medium flex items-center gap-1"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Open notebook <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
