import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StudentLayout from "@/layouts/StudentLayout";
import useStudySettings from "@/hooks/student/useStudySettings";
import { TIMETABLE_TEMPLATES } from "@/data/planning-tools/timetable-templates";

export default function StudentTimetablePage() {
  const { settings, loading, updateSettings } = useStudySettings();
  const timetable = settings.timetable || { templateKey: "full-time", checked: {}, notes: "" };
  const [templateKey, setTemplateKey] = useState(timetable.templateKey || "full-time");
  const [notes, setNotes] = useState(timetable.notes || "");
  const [checked, setChecked] = useState(timetable.checked || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    const saved = settings.timetable || {};
    setTemplateKey(saved.templateKey || "full-time");
    setChecked(saved.checked || {});
    setNotes(saved.notes || "");
  }, [loading, settings.timetable]);

  const template = TIMETABLE_TEMPLATES[templateKey] || TIMETABLE_TEMPLATES["full-time"];

  const completedCount = useMemo(() => {
    return template.blocks.filter((_, i) => checked[`${templateKey}-${i}`]).length;
  }, [template, templateKey, checked]);

  const persist = async (next) => {
    setSaving(true);
    try {
      await updateSettings({ timetable: next });
    } finally {
      setSaving(false);
    }
  };

  const switchTemplate = async (key) => {
    setTemplateKey(key);
    const next = { templateKey: key, checked, notes };
    await persist(next);
  };

  const toggleBlock = async (index) => {
    const id = `${templateKey}-${index}`;
    const nextChecked = { ...checked, [id]: !checked[id] };
    setChecked(nextChecked);
    await persist({ templateKey, checked: nextChecked, notes });
  };

  const saveNotes = async () => {
    await persist({ templateKey, checked, notes });
  };

  return (
    <StudentLayout
      title="Daily timetable"
      subtitle="Your saved routine — synced across devices."
    >
      <div className="card p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(TIMETABLE_TEMPLATES).map(([key, tpl]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchTemplate(key)}
              className="chip"
              style={{
                padding: "8px 12px",
                background: templateKey === key ? "var(--color-primary)" : "var(--color-surface)",
                color: templateKey === key ? "#fff" : "var(--color-ink-muted)",
                border: `1px solid ${templateKey === key ? "var(--color-primary)" : "var(--color-border)"}`,
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <p className="text-[13px] mb-4" style={{ color: "var(--color-ink-muted)" }}>
          {template.description} · {completedCount} / {template.blocks.length} blocks done today
          {saving ? " · Saving…" : ""}
        </p>

        <div className="grid gap-2">
          {template.blocks.map((block, index) => {
            const id = `${templateKey}-${index}`;
            const isDone = Boolean(checked[id]);
            return (
              <label
                key={id}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                style={{
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  opacity: isDone ? 0.65 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleBlock(index)}
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span className="text-[12px] font-mono shrink-0" style={{ color: "var(--color-primary)", minWidth: 100 }}>
                  {block.time}
                </span>
                <span
                  className="text-[14px] flex-1"
                  style={{
                    textDecoration: isDone ? "line-through" : "none",
                    color: "var(--color-ink)",
                  }}
                >
                  {block.activity}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="block text-[13px] font-medium mb-2" style={{ color: "var(--color-ink)" }}>
            Notes for today
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={3}
            className="w-full text-[13px] p-3 rounded-lg"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
            placeholder="Adjustments for today…"
          />
        </div>

        <div className="hairline-t mt-6 pt-4 flex flex-wrap gap-4 text-[12px]">
          <Link href="/student-desk/planner" style={{ color: "var(--color-primary)" }}>
            Open weekly planner →
          </Link>
          <Link href="/planning-tools/study-timetable" style={{ color: "var(--color-ink-muted)" }}>
            Read timetable guide
          </Link>
          <Link href="/planning-tools/upsc-calendar" style={{ color: "var(--color-ink-muted)" }}>
            UPSC exam calendar
          </Link>
        </div>
      </div>
    </StudentLayout>
  );
}
