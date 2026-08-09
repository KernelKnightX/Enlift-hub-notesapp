export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm" style={{ color: 'var(--color-ink-muted)' }}>
      {label}
    </div>
  );
}
