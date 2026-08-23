import { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

/**
 * View-only PDF panel. Uses Google Docs embedded viewer so students
 * don't get a native browser PDF toolbar with download/print controls.
 */
export default function SecurePdfViewer({ pdf, title }) {
  const rawUrl = pdf?.url || pdf?.pdfUrl || '';
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const viewerSrc = useMemo(() => {
    if (!rawUrl) return '';
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(rawUrl)}`;
  }, [rawUrl]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [viewerSrc]);

  if (!rawUrl) {
    return (
      <div className="notes-pdf-empty">
        <FileText size={28} strokeWidth={1.5} />
        <p>Select a PDF from the list to start reading.</p>
      </div>
    );
  }

  return (
    <div
      className="notes-pdf-viewer"
      onContextMenu={(e) => e.preventDefault()}
      data-testid="pdf-viewer-secure"
    >
      <div className="notes-pdf-viewer__bar">
        <div className="notes-pdf-viewer__meta">
          <span className="notes-pdf-viewer__label">VIEW ONLY</span>
          <span className="notes-pdf-viewer__title">{title || 'PDF'}</span>
        </div>
        <span className="notes-pdf-viewer__hint">Download &amp; print disabled</span>
      </div>

      <div className="notes-pdf-viewer__frame-wrap">
        {!loaded && !failed && (
          <div className="notes-pdf-viewer__loading">
            <Loader2 size={22} className="animate-spin" />
            <span>Loading PDF…</span>
          </div>
        )}
        {failed ? (
          <div className="notes-pdf-viewer__error">
            <p>Could not load this PDF in the secure viewer.</p>
            <p className="notes-pdf-viewer__error-sub">Ask your admin to verify the file URL is public.</p>
          </div>
        ) : (
          <iframe
            key={viewerSrc}
            src={viewerSrc}
            title={title || 'PDF document'}
            className="notes-pdf-viewer__frame"
            data-testid="pdf-frame"
            sandbox="allow-scripts allow-same-origin allow-popups"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
