import { Bell } from 'lucide-react';
import Link from 'next/link';

// Static notices copy from landing page. Replace with a shared data source when ready.
const NOTICES = [
  { id: 1, kind: 'result',      label: 'Result',       text: 'UPSC CSE 2026 Prelims result declared — check your roll number', href: '/updates/cse-prelims-result-2026' },
  { id: 2, kind: 'recruitment', label: 'Vacancy',      text: 'CAPF Assistant Commandant 2026 notification out — 322 posts',    href: '/updates/capf-ac-2026' },
  { id: 3, kind: 'answerkey',   label: 'Answer Key',   text: 'CDS (II) 2026 official answer key released',                     href: '/updates/cds-2-answer-key-2026' },
  { id: 4, kind: 'admitcard',   label: 'Admit Card',   text: 'IFoS Mains 2026 admit cards now available for download',         href: '/updates/ifos-mains-admit-card' },
  { id: 5, kind: 'recruitment', label: 'Vacancy',      text: 'Engineering Services Exam 2027 notification expected next week', href: '/updates/ese-2027-notification' },
];

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

export default function NoticeTicker({ notices = NOTICES }) {
  if (!notices || notices.length === 0) return null;

  return (
    <div className="notice-ticker hairline-t" data-testid="notice-ticker" style={{ background: 'var(--color-surface-alt)' }}>
      <div className="flex items-center gap-2 pl-4 md:pl-6 pr-3 shrink-0" style={{ borderRight: '1px solid var(--color-border)' }}>
        <Bell size={12} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
        <span className="text-[10.5px] font-mono tracking-wide hidden sm:inline" style={{ color: 'var(--color-ink-faint)' }}>
          UPDATES
        </span>
      </div>

      <div className="notice-ticker-viewport">
        <div className="notice-ticker-track">
          {[...notices, ...notices].map((n, i) => {
            const isExternal = /^https?:\/\//.test(n.href);
            const chipClass = NOTICE_CHIP[n.kind] || NOTICE_CHIP[n.type] || 'chip-primary';
            return (
              <a
                key={"notice-" + n.id + "-" + i}
                href={n.href || '#'}
                className="notice-item"
                target={isExternal ? '_blank' : '_self'}
                rel={isExternal ? 'noreferrer noopener' : undefined}
                tabIndex={i >= notices.length ? -1 : 0}
              >
                <span className={`chip ${chipClass}`} style={{ padding: '2px 8px', fontSize: 10 }}>
                  {n.label}
                </span>
                <span className="notice-text">{n.text}</span>
              </a>
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
          color: var(--color-ink-muted);
          font-size: 12.5px;
        }
        .notice-item:hover { color: var(--color-ink); }
        .notice-text { white-space: nowrap; }
        @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .notice-ticker-track { animation: none; } }
      `}</style>
    </div>
  );
}
