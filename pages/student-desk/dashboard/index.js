import StudentLayout from '../../../components/StudentLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, Clock, CheckCircle2, Circle, TrendingUp, ClipboardCheck,
  BookOpen, Flame, Target, Newspaper, Play, ChevronRight, Sparkles, Coffee,
  Calendar as CalIcon, AlertCircle, Database
} from 'lucide-react';
import useFirestoreCollection from '../../../hooks/useFirestoreCollection';

/* ── MOCK DATA (Firestore-swappable) ── */
const KPI_STATIC = [
  { label: 'Notes created', value: 42, delta: '+6 this week', icon: BookOpen, tone: 'primary' },
  { label: 'Mocks attempted', value: 18, delta: 'Avg. 72%', icon: ClipboardCheck, tone: 'accent' },
  { label: 'Study streak', value: 27, unit: 'days', delta: 'Best: 34', icon: Flame, tone: 'gold' },
  { label: 'Weak topics', value: 3, delta: 'Down from 6', icon: Target, tone: 'ink' },
];

const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)));

const COUNTDOWNS = [
  { name: 'UPSC CSE Prelims',  date: '2027-06-06', tone: 'primary' },
  { name: 'UPSC CSE Mains',    date: '2027-09-17', tone: 'accent' },
];

const TODO = [
  { text: 'Read: RBI MPC December minutes', done: true,  time: '30m' },
  { text: 'Revise: Fundamental Rights (Polity)', done: true,  time: '45m' },
  { text: 'Attempt: GS-I Prelims mock #12',  done: false, time: '60m' },
  { text: 'Write: Answer for Q3 (GS-II 2024)', done: false, time: '25m' },
  { text: 'Newspaper: The Hindu editorial',   done: false, time: '20m' },
];

const WEEK = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const WEEK_TASKS = [
  { day: 'MON', title: 'Modern History: 1857 revolt', chip: 'History', dur: '2h' },
  { day: 'TUE', title: 'Prelims Mock #12',            chip: 'Mock',    dur: '3h' },
  { day: 'WED', title: 'Environment: NDCs & IPCC',    chip: 'Env',     dur: '1.5h' },
  { day: 'THU', title: 'Mains Answer Writing GS-II',  chip: 'Mains',   dur: '2h' },
  { day: 'FRI', title: 'Revision: Polity chapter 4',  chip: 'Polity',  dur: '1h' },
];

const NOTIFS = [
  { id:'n1', title: 'New brief published', body: 'The Morning Brief · 28 Jan is live.', at: 'Just now', accent: true },
  { id:'n2', title: 'Mock leaderboard',    body: 'Prelims Mock #11 results updated.',   at: '2h ago' },
  { id:'n3', title: 'Notification',        body: 'UPSC ESE 2026 notification released.', at: 'Yesterday' },
];

const s = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return v;
  return fallback;
};
const num = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) ? n : fallback; };

const toNotif = (d) => ({
  id: d.id,
  title: s(d.title, s(d.heading, 'Notification')),
  body: s(d.message, s(d.body, s(d.description, ''))),
  at: d.createdAt?.toDate ? timeAgo(d.createdAt.toDate()) : s(d.at, 'Recent'),
  accent: !!d.important || !!d.accent,
});

function timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  if (s < 604800) return Math.floor(s/86400) + 'd ago';
  return date.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

const READING = [
  { cat: 'Polity',      title: 'ECI: Voter roll transparency framework', mins: 4 },
  { cat: 'Economy',     title: 'RBI\'s policy pivot: reading the MPC minutes', mins: 5 },
  { cat: 'Environment', title: 'India\'s revised NDCs — a primer', mins: 6 },
];

/* ── PAGE ── */
export default function Dashboard() {
  const { data: notifs, isMock: notifsMock } = useFirestoreCollection({
    name: 'adminNotifications',
    where: [['isActive', '==', true]],
    orderBy: ['createdAt', 'desc'],
    limit: 6,
    fallback: NOTIFS,
    transform: (docs) => docs.map(toNotif),
  });
  const { data: liveMocks } = useFirestoreCollection({
    name: 'mockTests', limit: 500, fallback: [],
    transform: (docs) => docs,
  });
  const { data: liveCa } = useFirestoreCollection({
    name: 'currentAffairs', where: [['isActive', '==', true]], orderBy: ['createdAt', 'desc'], limit: 3, fallback: [],
    transform: (docs) => docs.map(d => ({
      id: d.id,
      cat: s(d.category, 'General'),
      title: s(d.title, 'Untitled'),
      mins: num(d.readTime ?? d.mins, 4),
    })),
  });
  const readingList = liveCa.length ? liveCa : READING;

  return (
    <StudentLayout title="Welcome back" subtitle="Your desk, quietly organised.">
      {notifsMock && (
        <div className="mb-4 flex items-center gap-2 chip chip-amber" data-testid="dashboard-data-source">
          <Database size={11} strokeWidth={1.75} />
          Live counts wire to Firestore automatically when Admin publishes content
        </div>
      )}
      {/* Countdown + Progress row */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}
          className="col-span-12 lg:col-span-8 card p-6 md:p-8 relative overflow-hidden"
          data-testid="countdown-card"
          style={{ background: 'var(--color-ink)', color: 'var(--color-bg)', borderColor: 'transparent' }}
        >
          <div className="flex items-center gap-2">
            <Coffee size={15} strokeWidth={1.6} style={{ color: 'var(--color-accent)' }} />
            <span className="eyebrow" style={{ color: '#8A9993' }}>Exam Countdown</span>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COUNTDOWNS.map(c => {
              const days = daysUntil(c.date);
              return (
                <div key={c.name}>
                  <div className="text-[13px]" style={{ color: '#B7BFB8' }}>{c.name}</div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="display-num" style={{ fontSize: 68, lineHeight: 1, color: c.tone === 'accent' ? 'var(--color-accent)' : 'var(--color-bg)' }}>{days}</span>
                    <span className="text-[13px]" style={{ color: '#8A9993' }}>days to go</span>
                  </div>
                  <div className="text-[12.5px] mt-1 font-mono" style={{ color: '#8A9993' }}>
                    {new Date(c.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hairline-t mt-8 pt-5 flex items-center justify-between" style={{ borderColor: '#2A3631' }}>
            <div className="text-[12.5px]" style={{ color: '#B7BFB8' }}>Keep pace. Consistency &gt; intensity.</div>
            <Link href="/student-desk/planner" className="text-[12.5px] font-medium flex items-center gap-1" style={{ color: 'var(--color-bg)' }}>
              Open planner <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .05 }}
          className="col-span-12 lg:col-span-4 card p-6 md:p-8"
          data-testid="progress-ring"
        >
          <div className="eyebrow mb-2">Weekly progress</div>
          <div className="flex items-center gap-6 mt-3">
            <ProgressRing pct={68} />
            <div>
              <div className="display-num text-[42px]" style={{ color: 'var(--color-primary)' }}>68<span className="text-[22px]" style={{ color: 'var(--color-ink-muted)' }}>%</span></div>
              <div className="text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>of your weekly goals</div>
              <div className="mt-2 text-[12px] flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
                <TrendingUp size={13} strokeWidth={1.6} /> +12% vs last week
              </div>
            </div>
          </div>
          <div className="hairline-t mt-6 pt-4 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
            <div className="flex items-center justify-between"><span>Study hours</span><span className="font-mono" style={{ color: 'var(--color-ink)' }}>26.5 / 40</span></div>
            <div className="flex items-center justify-between mt-1.5"><span>Notes written</span><span className="font-mono" style={{ color: 'var(--color-ink)' }}>7 / 10</span></div>
            <div className="flex items-center justify-between mt-1.5"><span>Mocks attempted</span><span className="font-mono" style={{ color: 'var(--color-ink)' }}>2 / 3</span></div>
          </div>
        </motion.div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { ...KPI_STATIC[0] },
          { ...KPI_STATIC[1], delta: liveMocks.length ? `${liveMocks.length} tests live` : 'Avg. 72%' },
          { ...KPI_STATIC[2] },
          { ...KPI_STATIC[3] },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, delay: i * 0.05 }}
            className="card p-5 md:p-6"
            data-testid={`kpi-${k.label.toLowerCase().replace(/\s/g,'-')}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="eyebrow">{k.label}</span>
              <k.icon size={16} strokeWidth={1.5} style={{
                color: k.tone === 'accent' ? 'var(--color-accent)' :
                       k.tone === 'gold' ? 'var(--color-gold)' :
                       k.tone === 'ink' ? 'var(--color-ink-muted)' : 'var(--color-primary)'
              }} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="display-num text-[42px]" style={{ color: 'var(--color-ink)' }}>{k.value}</span>
              {k.unit && <span className="text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>{k.unit}</span>}
            </div>
            <div className="mt-1 text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>{k.delta}</div>
          </motion.div>
        ))}
      </div>

      {/* Middle row: To-Do + Reading */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-7 card p-6 md:p-8" data-testid="todo-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow mb-1.5">Today&apos;s to-do</div>
              <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>{TODO.filter(t => !t.done).length} tasks left today</div>
            </div>
            <button className="chip chip-primary" style={{ background: 'transparent' }}>+ Add task</button>
          </div>
          <ul className="mt-5 flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {TODO.map((t, i) => (
              <li key={i} className="flex items-center gap-3 py-3.5" style={{ borderTop: i === 0 ? '1px solid var(--color-border)' : 'none' }}>
                {t.done
                  ? <CheckCircle2 size={19} strokeWidth={1.6} style={{ color: 'var(--color-primary)' }} />
                  : <Circle size={19} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />}
                <span className="flex-1 text-[14.5px]" style={{ color: t.done ? 'var(--color-ink-faint)' : 'var(--color-ink)', textDecoration: t.done ? 'line-through' : 'none' }}>
                  {t.text}
                </span>
                <span className="text-[11.5px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>{t.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 lg:col-span-5 card p-6 md:p-8" data-testid="reading-card">
          <div className="flex items-center justify-between mb-1.5">
            <div className="eyebrow">Today&apos;s reading list</div>
            <Link href="/student-desk/current-affairs" className="text-[12px] font-medium" style={{ color: 'var(--color-primary)' }}>
              Read all
            </Link>
          </div>
          <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>The Morning Brief</div>
          <div className="mt-5 flex flex-col gap-4">
            {readingList.map((r, i) => (
              <div key={r.id || i} className="flex items-start gap-3">
                <div className="font-sans italic text-[13px] min-w-[64px] pt-1" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{r.cat}</div>
                <div className="flex-1">
                  <div className="font-sans text-[15.5px] leading-[1.35]" style={{ fontWeight: 600 }}>{r.title}</div>
                  <div className="mt-1 text-[11.5px] flex items-center gap-1" style={{ color: 'var(--color-ink-muted)' }}>
                    <Clock size={11} strokeWidth={1.5} /> {r.mins} min read
                  </div>
                </div>
                <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly planner + notifications */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8 card p-6 md:p-8" data-testid="week-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow mb-1.5">This week</div>
              <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>A quiet, focused week ahead.</div>
            </div>
            <Link href="/student-desk/planner" className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: 12 }}>
              Open planner <ArrowUpRight size={13} strokeWidth={1.75} />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {WEEK.map((d, i) => {
              const task = WEEK_TASKS.find(x => x.day === d);
              const isToday = i === 1; // demo
              return (
                <div key={d} className="p-3 rounded-xl min-h-[110px] flex flex-col"
                     style={{
                       border: `1px solid ${isToday ? 'var(--color-primary)' : 'var(--color-border)'}`,
                       background: isToday ? 'var(--color-primary-tint)' : 'var(--color-surface)'
                     }}>
                  <div className="text-[10.5px] font-mono flex items-center justify-between" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.14em' }}>
                    <span>{d}</span>
                    {isToday && <span style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--color-accent)' }} />}
                  </div>
                  {task ? (
                    <>
                      <div className="mt-2 chip" style={{ padding: '2px 8px', fontSize: 10 }}>{task.chip}</div>
                      <div className="mt-1 text-[12.5px] leading-tight" style={{ color: 'var(--color-ink)' }}>{task.title}</div>
                      <div className="mt-auto text-[11px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>{task.dur}</div>
                    </>
                  ) : (
                    <div className="mt-auto text-[11px]" style={{ color: 'var(--color-ink-faint)' }}>—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 card p-6 md:p-8" data-testid="notifs-card">
          <div className="flex items-center justify-between mb-4">
            <div className="eyebrow">Notifications</div>
            <span className="chip chip-accent" style={{ padding: '2px 8px', fontSize: 10 }}>{notifs.filter(n => n.accent).length} new</span>
          </div>
          <div className="flex flex-col gap-4">
            {notifs.map((n, i) => (
              <div key={n.id || i} className="pb-4 hairline-b last:border-b-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: n.accent ? 'var(--color-accent)' : 'var(--color-border-strong)', marginTop: 7 }} />
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold">{n.title}</div>
                    <div className="text-[12.5px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>{n.body}</div>
                    <div className="text-[11px] mt-1 font-mono" style={{ color: 'var(--color-ink-faint)' }}>{n.at}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Newspaper, label: 'Read today\'s brief', href: '/student-desk/current-affairs' },
          { icon: ClipboardCheck, label: 'Attempt a mock',   href: '/student-desk/mock-tests' },
          { icon: BookOpen, label: 'Open notes',             href: '/student-desk/notes' },
          { icon: CalIcon,  label: 'Plan the week',          href: '/student-desk/planner' },
        ].map((a, i) => (
          <Link key={i} href={a.href}
                className="card card-hover p-5 flex items-center gap-3"
                data-testid={`quick-${i}`}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'var(--color-primary-tint)', color: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <a.icon size={17} strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-[13.5px] font-medium">{a.label}</div>
            <ChevronRight size={16} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />
          </Link>
        ))}
      </div>
    </StudentLayout>
  );
}

function ProgressRing({ pct }) {
  const r = 40, c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <svg width={100} height={100}>
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="ring-track" />
      <motion.circle
        cx="50" cy="50" r={r} fill="none" strokeWidth="8"
        className="ring-progress" strokeLinecap="round"
        transform="rotate(-90 50 50)"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${dash} ${c}` }}
        transition={{ duration: 1.1, ease: [.2,.7,.2,1] }}
      />
    </svg>
  );
}
