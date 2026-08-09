export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[24px] border p-8 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
      <h3 className="font-serif text-[22px] leading-[1.14]">{title}</h3>
      {description ? <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: 'var(--color-ink-muted)' }}>{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
