import { X } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const confirmClass = tone === 'danger' ? 'btn btn-accent' : 'btn btn-primary';

  return (
    <div className="mock-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="mock-modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mock-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mock-modal__head">
          <h2 id="mock-modal-title" className="mock-modal__title">{title}</h2>
          <button type="button" className="mock-modal__close" onClick={onCancel} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <p className="mock-modal__body">{message}</p>
        <div className="mock-modal__actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
