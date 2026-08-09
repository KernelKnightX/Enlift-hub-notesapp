import React from 'react';

export default function BookPreviewModal({ isOpen, onClose, pdfUrl, title }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1200 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,15,20,0.6)' }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '1100px', height: '85vh', background: 'var(--color-bg)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 18px 40px rgba(2,6,23,0.5)' }} role="dialog" aria-modal="true" aria-label={`Preview ${title}`}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>{title}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {pdfUrl ? (
              <a href={pdfUrl} target="_blank" rel="noreferrer noopener" download style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Download</a>
            ) : null}
            <button onClick={onClose} aria-label="Close preview" style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--color-ink-muted)', fontSize: 18 }}>✕</button>
          </div>
        </div>

        <div style={{ width: '100%', height: 'calc(100% - 56px)', background: 'var(--color-surface)' }}>
          {pdfUrl ? (
            // Use iframe as a lightweight PDF preview (works for remote PDF URLs / Firebase storage links)
            <iframe src={pdfUrl} title={title} style={{ width: '100%', height: '100%', border: 0 }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>No preview available</div>
                <div style={{ marginTop: 8 }}>This book does not have a preview PDF attached.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
