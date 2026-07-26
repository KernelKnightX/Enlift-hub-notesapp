import { useState } from 'react';
import Link from 'next/link';
import StudentLayout from '../../../components/StudentLayout';
import { motion } from 'framer-motion';
import {
  Plus, Search, FileText, Download, Star, MoreHorizontal, Sparkles, ChevronRight,
  Filter, BookOpen, Upload, Database
} from 'lucide-react';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';

const MOCK_SUBJECTS = [
  { id:'s1', code:'HIS', name:'Modern History',  count:14, tone:'violet' },
  { id:'s2', code:'POL', name:'Polity',          count:11, tone:'pink'  },
  { id:'s3', code:'GEO', name:'Geography',       count:9,  tone:'green' },
  { id:'s4', code:'ECO', name:'Economy',         count:8,  tone:'blue' },
  { id:'s5', code:'ENV', name:'Environment',     count:6,  tone:'lime' },
  { id:'s6', code:'S&T', name:'Science & Tech',  count:5,  tone:'cyan' },
  { id:'s7', code:'ETH', name:'Ethics (GS-IV)',  count:7,  tone:'amber' },
  { id:'s8', code:'IR',  name:'International',   count:4,  tone:'primary' },
];

const TONES = ['violet','pink','green','blue','lime','cyan','amber','primary'];

const ss = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return v;
  return fallback;
};
const nn = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };

const toSubject = (d, i) => {
  const nameStr = String(ss(d.name, ss(d.title, 'Subject')));
  return {
    id: d.id,
    code: String(ss(d.code, nameStr.split(' ').map(w => w[0]).join('').slice(0,3))).toUpperCase(),
    name: nameStr,
    count: nn(d.pdfCount ?? d.count ?? d.notesCount, 0),
    tone: ss(d.color, TONES[i % TONES.length]),
  };
};

const RECENT = [
  { subj:'Polity', title:'Fundamental Rights vs Directive Principles', pages:9,  updated:'2h ago', starred:true },
  { subj:'Modern History', title:'Revolt of 1857 — causes, spread, aftermath', pages:12, updated:'Yesterday' },
  { subj:'Economy', title:'RBI MPC minutes — Dec 2025 notes',           pages:5,  updated:'Yesterday', starred:true },
  { subj:'Environment', title:'IPCC AR6 synthesis + NDCs',              pages:8,  updated:'2 days ago' },
  { subj:'Geography', title:'Indian Monsoon Systems — visual primer',   pages:14, updated:'3 days ago' },
  { subj:'Ethics', title:'Case Study Approach — Framework',             pages:6,  updated:'4 days ago' },
];

export default function NotesPage() {
  const [q, setQ] = useState('');
  const filtered = RECENT.filter(r =>
    q.trim() === '' || r.title.toLowerCase().includes(q.toLowerCase()) || r.subj.toLowerCase().includes(q.toLowerCase())
  );

  const { data: SUBJECTS, isMock } = useFirestoreCollection({
    name: 'pdfSubjects',
    orderBy: ['name', 'asc'],
    limit: 100,
    fallback: MOCK_SUBJECTS,
    transform: (docs) => docs.map(toSubject),
  });

  return (
    <StudentLayout title="Study Notes" subtitle="A distraction-free notebook that respects your prep.">
      {isMock && (
        <div className="mb-4 flex items-center gap-2 chip chip-amber" data-testid="notes-data-source">
          <Database size={11} strokeWidth={1.75} />
          Showing sample subjects · Create subjects from Admin → Notes to see live data here
        </div>
      )}
      {/* Actions strip */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 md:max-w-[420px]"
             style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-ink-muted)' }} />
          <input value={q} onChange={e => setQ(e.target.value)}
                 placeholder="Search notes, subjects, titles…" data-testid="notes-search"
                 className="bg-transparent outline-none text-[14px] flex-1" style={{ color: 'var(--color-ink)' }} />
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <button className="btn btn-ghost" style={{ padding: '0.55rem 1rem', fontSize: 12.5 }} data-testid="notes-upload">
            <Upload size={14} strokeWidth={1.6} /> Import PDF
          </button>
          <button className="btn btn-primary" data-testid="notes-new">
            <Plus size={15} strokeWidth={2} /> New note
          </button>
        </div>
      </div>

      {/* Subject grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="eyebrow">Subjects</div>
          <span className="text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>{SUBJECTS.length} subjects · {SUBJECTS.reduce((s, x) => s + x.count, 0)} notes</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUBJECTS.map((subj, i) => (
            <motion.div
              key={subj.id || subj.code || i}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: i * 0.03 }}>
              <Link href={`/student-desk/notes/${encodeURIComponent(subj.id || subj.code || 'demo')}`}
                    className="card card-hover p-5 text-left block h-full"
                    data-testid={`subject-${subj.code}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className={`chip chip-${subj.tone || 'primary'}`} style={{ fontStyle: 'italic', letterSpacing: 0, fontWeight: 700 }}>
                    {subj.code}
                  </div>
                  <span className="display-num text-[26px]" style={{ color: 'var(--color-ink)' }}>{subj.count}</span>
                </div>
                <div className="font-sans text-[16.5px]" style={{ fontWeight: 700, letterSpacing: '-0.005em' }}>{subj.name}</div>
                <div className="mt-3 text-[11.5px] flex items-center gap-1" style={{ color: 'var(--color-ink-muted)' }}>
                  Open notes <ChevronRight size={12} strokeWidth={1.5} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent notes */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="eyebrow mb-1">Recently edited</div>
            <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>Continue where you left off</div>
          </div>
          <button className="text-[12.5px] font-medium" style={{ color: 'var(--color-primary)' }} data-testid="notes-view-all">View all</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3, delay: i * 0.03 }}
              className="card card-hover p-5 cursor-pointer relative"
              data-testid={`note-${i}`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="chip">{n.subj}</span>
                <div className="flex items-center gap-1">
                  {n.starred && <Star size={13} fill="var(--color-gold)" style={{ color: 'var(--color-gold)' }} />}
                  <button style={{ color: 'var(--color-ink-muted)' }}><MoreHorizontal size={16} strokeWidth={1.5} /></button>
                </div>
              </div>
              {/* Faux paper */}
              <div className="rounded-lg p-4 mb-4 relative overflow-hidden"
                   style={{ background: 'var(--color-surface-alt)', border: '1px dashed var(--color-border-strong)', minHeight: 84 }}>
                <div className="font-serif text-[15px] leading-[1.35] clamp-3">{n.title}</div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {[80, 60, 40].map((w, k) => (
                    <div key={k} style={{ width: `${w}%`, height: 3, background: 'var(--color-border-strong)', borderRadius: 999 }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                <span className="font-mono">{n.pages} pp · {n.updated}</span>
                <span className="flex items-center gap-1"><Download size={12} strokeWidth={1.5} /> PDF</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Plus banner */}
      <div className="mt-10 card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4"
           style={{ background: 'var(--color-primary-tint)', borderColor: 'transparent' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: 'var(--color-primary)', color: 'var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={16} strokeWidth={1.5} />
          </div>
          <div>
            <div className="font-serif text-[17px]" style={{ letterSpacing: '-0.01em' }}>Get unlimited notes, cross-device sync & PDF export</div>
            <div className="text-[13px] mt-0.5" style={{ color: 'var(--color-primary)' }}>Plus members can also request AI-generated study summaries.</div>
          </div>
        </div>
        <button className="btn btn-primary md:ml-auto" data-testid="notes-upgrade">Try Plus free for 7 days</button>
      </div>
    </StudentLayout>
  );
}
