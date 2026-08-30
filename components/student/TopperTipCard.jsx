import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import useFirestoreCollection from "@/hooks/shared/useFirestoreCollection";

const isoWeek = (date = new Date()) => {
  const thursday = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
};

export default function TopperTipCard() {
  const {
    data: tips,
    isLoading,
    isError,
  } = useFirestoreCollection({
    name: "topperTips",
    limit: 100,
    fallback: [],
    transform: (docs) =>
      docs.filter((tip) => typeof tip.quote === "string" && tip.quote.trim()),
  });
  const tip = tips.length ? tips[isoWeek() % tips.length] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="col-span-12 md:col-span-6 card p-6 md:p-8"
      data-testid="topper-tip-card"
    >
      <div className="flex items-center gap-2">
        <Lightbulb
          size={16}
          strokeWidth={1.6}
          style={{ color: "var(--color-accent)" }}
        />
        <span className="eyebrow">Topper&apos;s tip</span>
      </div>
      {isLoading ? (
        <div
          className="mt-6 text-[14px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Loading…
        </div>
      ) : isError || !tip ? (
        <div
          className="mt-6 text-[14px]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          No topper tip is available yet.
        </div>
      ) : (
        <>
          <blockquote className="mt-5 font-italic-serif text-[20px] leading-snug line-clamp-2">
            “{tip.quote}”
          </blockquote>
          <div
            className="mt-4 text-[12.5px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            —{" "}
            {tip.attribution ||
              `AIR ${tip.rank || "—"}, UPSC CSE ${tip.year || ""}`}
          </div>
        </>
      )}
    </motion.div>
  );
}
