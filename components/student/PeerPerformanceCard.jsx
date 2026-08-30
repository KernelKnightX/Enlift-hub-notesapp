import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import usePeerPerformance from "@/hooks/student/usePeerPerformance";

export default function PeerPerformanceCard({ userId }) {
  const { attempt, total, percentile, loading, error } =
    usePeerPerformance(userId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 md:col-span-6 card p-6 md:p-8"
      data-testid="peer-performance-card"
    >
      <div className="flex items-center gap-2">
        <Trophy
          size={16}
          strokeWidth={1.6}
          style={{ color: "var(--color-gold)" }}
        />
        <span className="eyebrow">Peer performance</span>
      </div>
      {loading ? (
        <div
          className="mt-6 text-[14px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Loading…
        </div>
      ) : error ? (
        <div
          className="mt-6 text-[14px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Performance comparison unavailable right now.
        </div>
      ) : !attempt ? (
        <div
          className="mt-6 text-[15px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Attempt a mock to see how you compare.
        </div>
      ) : (
        <>
          <div className="mt-5 font-serif text-[25px] leading-tight">
            You&apos;re ahead of{" "}
            <span
              className="display-num"
              style={{ color: "var(--color-primary)", fontSize: 38 }}
            >
              {percentile}%
            </span>{" "}
            of aspirants
          </div>
          <div
            className="mt-5 h-2 overflow-hidden rounded-full"
            style={{ background: "var(--color-primary-tint)" }}
            aria-label={`${percentile}% percentile`}
          >
            <div
              style={{
                width: `${percentile}%`,
                height: "100%",
                background: "var(--color-primary)",
                borderRadius: 999,
              }}
            />
          </div>
          <div
            className="mt-2 text-[12px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Based on {total} attempt{total === 1 ? "" : "s"} on your latest
            mock.
          </div>
        </>
      )}
      <div className="hairline-t mt-6 pt-4">
        <Link
          href="/student-desk/mock-tests/leaderboard"
          className="text-[13px] font-medium flex items-center gap-1"
          style={{ color: "var(--color-primary)" }}
        >
          View Leaderboard <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
