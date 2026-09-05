import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

/**
 * Read-only HTML chapter viewer for Study Notes 2.
 * Loads HTML from a Firebase Storage URL (or any public URL).
 */
export default function HtmlChapterViewer({ chapter, title }) {
  const src = chapter?.url || chapter?.htmlUrl || '';
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  if (!src) {
    return (
      <div className="notes-pdf-empty">
        <FileText size={28} strokeWidth={1.5} />
        <p>Select a chapter from the list to start reading.</p>
      </div>
    );
  }

  const displayTitle = title || chapter?.title || 'Chapter';

  return (
    <div
      className="notes-html-viewer"
      onContextMenu={(e) => e.preventDefault()}
      data-testid="html-chapter-viewer"
    >
      <div className="notes-pdf-viewer__bar">
        <div className="notes-pdf-viewer__meta">
          <span className="notes-pdf-viewer__label">READ ONLY</span>
          <span className="notes-pdf-viewer__title">{displayTitle}</span>
        </div>
        <span className="notes-pdf-viewer__hint">HTML chapter</span>
      </div>

      <div className="notes-pdf-viewer__frame-wrap">
        {!loaded && !failed && (
          <div className="notes-pdf-viewer__loading">
            <Loader2 size={22} className="animate-spin" />
            <span>Loading chapter…</span>
          </div>
        )}
        {failed ? (
          <div className="notes-pdf-viewer__error">
            <p>Could not load this HTML chapter.</p>
            <p className="notes-pdf-viewer__error-sub">
              Ask your admin to verify the file URL is public.
            </p>
          </div>
        ) : (
          <iframe
            key={src}
            src={src}
            title={displayTitle}
            className="notes-pdf-viewer__frame"
            data-testid="html-chapter-frame"
            sandbox="allow-same-origin"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
