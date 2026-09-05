import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2, Circle, Target } from "lucide-react";
import StudentLayout from "@/layouts/StudentLayout";
import useStudySettings from "@/hooks/student/useStudySettings";

const MAX_GOALS = 5;

export default function StudentGoalsPage() {
  const { settings, loading, updateSettings } = useStudySettings();
  const goals = settings.monthlyGoals || [];
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const persistGoals = async (nextGoals) => {
    setSaving(true);
    try {
      await updateSettings({ monthlyGoals: nextGoals });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const title = text.trim();
    if (!title || goals.length >= MAX_GOALS) return;
    const next = [
      ...goals,
      { id: `goal-${Date.now()}`, title, done: false, createdAt: new Date().toISOString() },
    ];
    await persistGoals(next);
    setText("");
  };

  const handleToggle = async (id) => {
    const next = goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    await persistGoals(next);
  };

  const handleRemove = async (id) => {
    await persistGoals(goals.filter((g) => g.id !== id));
  };

  const doneCount = goals.filter((g) => g.done).length;

  return (
    <StudentLayout title="Monthly goals">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8 card p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="eyebrow mb-1">This month</div>
              <h2 className="font-serif text-[24px]" style={{ letterSpacing: "-0.01em" }}>
                {doneCount} / {goals.length} goals completed
              </h2>
            </div>
            <Target size={20} style={{ color: "var(--color-primary)" }} />
          </div>

          <div className="flex gap-2 mb-5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Finish Environment one full read + revision"
              disabled={goals.length >= MAX_GOALS || saving}
              className="flex-1 text-[14px] px-3 py-2.5 rounded-lg"
              style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!text.trim() || goals.length >= MAX_GOALS || saving}
              className="chip chip-primary flex items-center gap-1"
              style={{ padding: "10px 14px" }}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {goals.length >= MAX_GOALS && (
            <p className="text-[12px] mb-4" style={{ color: "var(--color-ink-muted)" }}>
              Maximum {MAX_GOALS} monthly goals — finish or remove one to add another.
            </p>
          )}

          <ul className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
            {loading && (
              <li className="py-8 text-center text-[13px]" style={{ color: "var(--color-ink-faint)" }}>
                Loading goals…
              </li>
            )}
            {!loading && goals.length === 0 && (
              <li className="py-8 text-center text-[13px]" style={{ color: "var(--color-ink-faint)" }}>
                No monthly goals yet. Add up to {MAX_GOALS} priorities for this month.
              </li>
            )}
            {goals.map((goal) => (
              <li key={goal.id} className="flex items-center gap-3 py-3.5">
                <button type="button" onClick={() => handleToggle(goal.id)} aria-label="Toggle goal">
                  {goal.done ? (
                    <CheckCircle2 size={19} style={{ color: "var(--color-primary)" }} />
                  ) : (
                    <Circle size={19} style={{ color: "var(--color-border-strong)" }} />
                  )}
                </button>
                <span
                  className="flex-1 text-[14.5px]"
                  style={{
                    color: goal.done ? "var(--color-ink-faint)" : "var(--color-ink)",
                    textDecoration: goal.done ? "line-through" : "none",
                  }}
                >
                  {goal.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(goal.id)}
                  aria-label="Remove goal"
                  style={{ color: "var(--color-ink-faint)" }}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 lg:col-span-4 card p-6">
          <div className="eyebrow mb-3">Sunday review</div>
          <ol className="text-[13px] space-y-2" style={{ color: "var(--color-ink-muted)", paddingLeft: 18 }}>
            <li>What did I finish that I planned?</li>
            <li>What slipped — unrealistic plan or weak execution?</li>
            <li>What are my top 3 priorities for next week?</li>
          </ol>
          <Link
            href="/student-desk/planner"
            className="mt-5 inline-flex text-[13px] font-medium"
            style={{ color: "var(--color-primary)" }}
          >
            Open weekly planner →
          </Link>
          <Link
            href="/planning-tools/goal-tracker"
            className="mt-2 block text-[12px]"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Read goal-tracking guide
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
