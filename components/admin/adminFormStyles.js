import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const inputClass =
  "w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]";

export const labelClass = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";

export function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-semibold">
      <span className={labelClass}>{label}</span>
      {children}
      {hint ? (
        <span className="mt-1 block text-xs font-normal text-[var(--color-ink-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}

export function SectionCard({ title, children, actions }) {
  return (
    <section className="card space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function PreviewLink({ href }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]"
    >
      Preview public page
      <ExternalLink size={14} />
    </Link>
  );
}

export function JsonEditor({ value, onChange, rows = 18 }) {
  return (
    <textarea
      className={`${inputClass} font-mono text-xs leading-relaxed`}
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck={false}
    />
  );
}
