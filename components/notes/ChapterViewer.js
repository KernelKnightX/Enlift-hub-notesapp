import { useEffect, useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

/** Clean chapter reader for Study Notes — no technical or policy copy in the UI. */
export default function ChapterViewer({ chapter, title }) {
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
        <p>Choose a chapter from the list to begin.</p>
      </div>
    );
  }

  const displayTitle = title || chapter?.title || 'Chapter';

  return (
    <div
      className="notes-pdf-viewer notes-chapter-viewer"
      onContextMenu={(e) => e.preventDefault()}
      data-testid="chapter-viewer"
    >
      <div className="notes-pdf-viewer__frame-wrap">
        {!loaded && !failed && (
          <div className="notes-pdf-viewer__loading">
            <Loader2 size={22} className="animate-spin" />
          </div>
        )}
        {failed ? (
          <div className="notes-pdf-viewer__error">
            <p>This chapter isn&apos;t available right now.</p>
            <p className="notes-pdf-viewer__error-sub">Please try another chapter from the list.</p>
          </div>
        ) : (
          <iframe
            key={src}
            src={src}
            title={displayTitle}
            className="notes-pdf-viewer__frame"
            data-testid="chapter-frame"
            sandbox="allow-same-origin allow-scripts"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
