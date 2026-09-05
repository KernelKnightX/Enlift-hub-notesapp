import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import StudentLayout from '@/layouts/StudentLayout';
import { motion } from 'framer-motion';
import {
  Landmark, Clock, Globe, TrendingUp, FlaskConical, Leaf, Shield, Newspaper,
  Scale, Users, Network, Brain, Sigma, FileText,
} from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';

// ---- Subject palette --------------------------------------------------
// Each subject gets an icon + a soft bg / ink color pair, matching the
// pastel icon-tile look in the reference design.
const PALETTE = {
  violet:  { bg: '#EFE9FE', ink: '#7C5CFC' },
  orange:  { bg: '#FDEEDC', ink: '#F0A23A' },
  green:   { bg: '#E4F6EA', ink: '#3EAE5F' },
  red:     { bg: '#FBE7E6', ink: '#E3564F' },
  blue:    { bg: '#E7EEFD', ink: '#4A79E8' },
  pink:    { bg: '#FCE8F1', ink: '#E0559B' },
  teal:    { bg: '#E1F5F2', ink: '#2AA893' },
  purple:  { bg: '#F1E9FB', ink: '#8A5CD6' },
};

const ss = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return v;
  return fallback;
};
const nn = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };

const TONE_KEYS = Object.keys(PALETTE);

const toSubject = (d, i) => {
  const nameStr = String(ss(d.name, ss(d.title, 'Subject')));
  return {
    id: d.id,
    code: String(ss(d.code, nameStr.split(' ').map(w => w[0]).join('').slice(0, 3))).toUpperCase(),
    name: nameStr,
    count: nn(d.chapterCount ?? d.pdfCount ?? d.count ?? d.notesCount, 0),
    tone: TONE_KEYS.includes(ss(d.color)) ? ss(d.color) : TONE_KEYS[i % TONE_KEYS.length],
    icon: d.icon || FileText,
  };
};

function IconTile({ tone, Icon, size = 40, radius = 12, iconSize = 18 }) {
  const colors = PALETTE[tone] || PALETTE.blue;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius,
        background: colors.bg, color: colors.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      <Icon size={iconSize} strokeWidth={1.75} />
    </div>
  );
}

export default function NotesPage() {
  const router = useRouter();
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof router.query.q === 'string') {
      setQ(router.query.q);
    }
  }, [router.isReady, router.query.q]);

  const { data: SUBJECTS } = useFirestoreCollection({
    name: 'htmlNoteSubjects',
    orderBy: ['order', 'asc'],
    limit: 100,
    transform: (docs) => docs.map(toSubject),
  });

  const visibleSubjects = q.trim() === ''
    ? SUBJECTS
    : SUBJECTS.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <StudentLayout title="Study Notes">
      <div className="grid grid-cols-1 gap-8 items-start">
        {/* ---------------- Main column ---------------- */}
        <div className="min-w-0">
          {/* Subjects */}
          <div className="flex items-center justify-between mb-4">
            <div className="font-serif text-[20px]" style={{ letterSpacing: '-0.01em' }}>
              All Subjects <span style={{ color: 'var(--color-ink-muted)' }}>({visibleSubjects.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleSubjects.length === 0 ? (
              <div className="col-span-full card p-10 text-center">
                <FileText size={32} strokeWidth={1.4} style={{ color: 'var(--color-ink-faint)', margin: '0 auto' }} />
                <p className="mt-4 font-serif text-[22px]">No study notes yet</p>
                <p className="mt-2 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
                  Notes published from Admin → Study Notes will appear here.
                </p>
              </div>
            ) : visibleSubjects.map((subj, i) => {
              const isEmoji = typeof subj.icon === 'string' && subj.icon.length <= 4;
              const Icon = isEmoji ? FileText : (subj.icon || FileText);
              return (
                <motion.div
                  key={subj.id || subj.code || i}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .25, delay: i * 0.02 }}
                >
                  <Link
                    href={`/student-desk/notes/${encodeURIComponent(subj.id || subj.code || 'demo')}`}
                    className="card card-hover flex items-center gap-3 p-4 min-h-[88px]"
                    data-testid={`subject-${subj.code}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isEmoji ? (
                        <div
                          style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: PALETTE[subj.tone]?.bg || PALETTE.blue.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, flexShrink: 0,
                          }}
                        >
                          {subj.icon}
                        </div>
                      ) : (
                        <IconTile tone={subj.tone} Icon={Icon} />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">{subj.name}</div>
                        <div className="text-[12px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>{subj.count} chapters</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}