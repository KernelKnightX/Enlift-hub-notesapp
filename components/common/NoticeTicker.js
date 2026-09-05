import Link from 'next/link';
import { Bell } from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';
import { isExternalHref, sanitizeHref } from '@/lib/safeUrl';

const NOTICE_CHIP = {
  result: 'chip-primary',
  recruitment: 'chip-accent',
  answerkey: 'chip-gold',
  admitcard: 'chip-primary',
  info: 'chip-primary',
  success: 'chip-green',
  warning: 'chip-amber',
  error: 'chip-accent',
};

const TYPE_LABELS = {
  info: 'Info',
  success: 'Update',
  warning: 'Alert',
  error: 'Urgent',
};

function isHomepageNotice(doc) {
  const target = doc.target || 'home';
  return target === 'home' || target === 'both';
}

function toTickerNotice(doc) {
  const href = sanitizeHref(doc.href);
  if (!href) return null;

  const text = doc.message?.trim() || doc.title?.trim() || '';
  if (!text) return null;

  return {
    id: doc.id,
    kind: doc.type || 'info',
    label: doc.title?.trim() || TYPE_LABELS[doc.type] || 'Update',
    text,
    href,
    isExternal: isExternalHref(href),
  };
}

export default function NoticeTicker() {
  const { data: liveNotices, isLoading } = useFirestoreCollection({
    name: 'adminNotifications',
    orderBy: ['createdAt', 'desc'],
    limit: 30,
    transform: (docs) =>
      docs
        .filter((doc) => doc.isActive !== false && isHomepageNotice(doc))
        .map(toTickerNotice)
        .filter(Boolean),
  });

  if (isLoading) return null;
  if (!liveNotices.length) return null;

  return (
    <div className="notice-ticker notice-ticker--dark" data-testid="notice-ticker" style={{ background: '#151A18', borderTop: '1px solid #2A3631' }}>
      <div className="flex items-center gap-2 pl-4 md:pl-6 pr-3 shrink-0" style={{ borderRight: '1px solid #2A3631' }}>
        <Bell size={12} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
        <span className="text-[10.5px] font-mono tracking-wide hidden sm:inline" style={{ color: '#8A9993' }}>
          UPDATES
        </span>
      </div>

      <div className="notice-ticker-viewport">
        <div className="notice-ticker-track">
          {[...liveNotices, ...liveNotices].map((notice, index) => {
            const chipClass = NOTICE_CHIP[notice.kind] || 'chip-primary';
            const content = (
              <>
                <span className={`chip ${chipClass}`} style={{ padding: '2px 8px', fontSize: 10 }}>
                  {notice.label}
                </span>
                <span className="notice-text">{notice.text}</span>
              </>
            );

            return notice.isExternal ? (
              <a
                key={`notice-${notice.id}-${index}`}
                href={notice.href}
                className="notice-item"
                target="_blank"
                rel="noreferrer noopener"
                tabIndex={index >= liveNotices.length ? -1 : 0}
              >
                {content}
              </a>
            ) : (
              <Link
                key={`notice-${notice.id}-${index}`}
                href={notice.href}
                className="notice-item"
                tabIndex={index >= liveNotices.length ? -1 : 0}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .notice-ticker {
          display: flex;
          align-items: center;
          height: 36px;
          overflow: hidden;
        }
        .notice-ticker-viewport {
          flex: 1;
          overflow: hidden;
          position: relative;
          height: 100%;
        }
        .notice-ticker-track {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          height: 100%;
          white-space: nowrap;
          width: max-content;
          animation: ticker-scroll 34s linear infinite;
          padding-left: 1.5rem;
        }
        .notice-ticker:hover .notice-ticker-track {
          animation-play-state: paused;
        }
        .notice-item {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #B7BFB8;
          font-size: 12.5px;
          cursor: pointer;
        }
        .notice-item:hover { color: #FFFFFF; }
        .notice-text { white-space: nowrap; }
        @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .notice-ticker-track { animation: none; } }
      `}</style>
    </div>
  );
}
