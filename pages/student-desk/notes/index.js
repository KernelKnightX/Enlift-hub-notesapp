import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import StudentLayout from '../../../components/common/StudentLayout';
import { motion } from 'framer-motion';
import {
  Landmark, Clock, Globe, TrendingUp, FlaskConical, Leaf, Shield, Newspaper,
  Scale, Users, Network, Brain, Sigma, FileText, ExternalLink, Library
} from 'lucide-react';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';

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

const toCollection = (d) => ({
  id: d.id,
  name: String(ss(d.name, 'Collection')),
  description: String(ss(d.description, '')).trim(),
  count: nn(d.count, 0),
  color: String(ss(d.color, '#7C5CFC')),
  imageUrl: String(ss(d.imageUrl, '')),
});

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
    count: nn(d.pdfCount ?? d.count ?? d.notesCount, 0),
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
    name: 'pdfSubjects',
    orderBy: ['order', 'asc'],
    limit: 100,
    fallback: [],
    transform: (docs) => docs.map(toSubject),
  });

  const { data: COLLECTIONS } = useFirestoreCollection({
    name: 'noteCollections',
    orderBy: ['order', 'asc'],
    limit: 100,
    fallback: [],
    transform: (docs) => docs.map(toCollection),
  });

  const visibleSubjects = q.trim() === ''
    ? SUBJECTS
    : SUBJECTS.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <StudentLayout title="Study Notes" subtitle="A distraction-free notebook that respects your prep.">
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
            {visibleSubjects.map((subj, i) => {
              const Icon = subj.icon || FileText;
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
                      <IconTile tone={subj.tone} Icon={Icon} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">{subj.name}</div>
                        <div className="text-[12px] mt-1" style={{ color: 'var(--color-ink-muted)' }}>{subj.count} Notes</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Top Collections */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div className="font-serif text-[20px]" style={{ letterSpacing: '-0.01em' }}>Top Collections</div>
              <button className="text-[12.5px] font-medium" style={{ color: 'var(--color-primary)' }} data-testid="collections-view-all">
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLLECTIONS.map((c, i) => {
                const colors = PALETTE[c.color ?? 'blue'] || PALETTE.blue;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: .25, delay: i * 0.03 }}
                    className="card card-hover relative overflow-hidden"
                    style={{ minHeight: 190, borderColor: 'transparent' }}
                    data-testid={`collection-${c.id}`}
                  >
                    {c.imageUrl ? (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${c.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)' }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0" style={{ background: colors.bg }} />
                    )}

                    <div className="relative flex flex-col justify-between h-full p-6">
                      <div>
                        <div className="font-serif text-[16px] leading-snug" style={{ letterSpacing: '-0.005em', color: c.imageUrl ? '#fff' : colors.ink }}>{c.name}</div>
                        <div className="text-[12.5px] mt-1" style={{ color: c.imageUrl ? 'rgba(255,255,255,0.85)' : colors.ink }}>{c.count} Notes</div>
                      </div>
                      <div className="flex items-end justify-between mt-6">
                        <button
                          className="text-[12.5px] font-semibold flex items-center gap-1"
                          style={{ color: c.imageUrl ? '#fff' : colors.ink }}
                          data-testid={`collection-explore-${c.id}`}
                        >
                          Explore Collection <ExternalLink size={12} strokeWidth={2} />
                        </button>
                        <Library size={34} strokeWidth={1.25} style={{ color: c.imageUrl ? 'rgba(255,255,255,0.75)' : colors.ink, opacity: 0.75 }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}