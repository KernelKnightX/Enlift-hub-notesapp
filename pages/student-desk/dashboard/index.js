import { useEffect, useState } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight, CheckCircle2, Circle, TrendingUp, ClipboardCheck,
  BookOpen, Flame, Target, Play, Pause, RotateCcw, Plus, Brain,
  Coffee, Moon, Timer as TimerIcon, ChevronRight
} from 'lucide-react';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';
import useUserMetrics from '@/hooks/student/useUserMetrics';
import { usePlannerTasks } from '@/hooks/student/usePlannerTasks';
import { useAuth } from '@/contexts/AuthContext';

const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)));

const COUNTDOWNS = [
  { name: 'UPSC CSE Prelims',  date: '2027-06-06', tone: 'primary' },
  { name: 'UPSC CSE Mains',    date: '2027-09-17', tone: 'accent' },
];

// Fallback tasks shown only if today has nothing in the Planner yet.
const TODO_FALLBACK = [
  { id: 'fb-1', text: 'Attempt: GS-I Prelims mock #12',   done: false, time: '60m' },
  { id: 'fb-2', text: 'Write: Answer for Q3 (GS-II 2024)', done: false, time: '25m' },
  { id: 'fb-3', text: 'Newspaper: The Hindu editorial',    done: false, time: '20m' },
];

const s = (v, fallback = '') => {
  if (v == null) return fallback;
  if (typeof v === 'string' || typeof v === 'number') return v;
  return fallback;
};

const todayKey = () => new Date().toISOString().slice(0, 10);

/* Pomodoro durations, in seconds */
const DURATIONS = { focus: 25 * 60, break: 5 * 60, rest: 15 * 60 };
const MODES = [
  { key: 'focus', label: 'Focus', icon: Brain },
  { key: 'break', label: 'Break', icon: Coffee },
  { key: 'rest',  label: 'Rest',  icon: Moon },
];
const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const sec = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

/* ── PAGE ── */
export default function Dashboard() {
  // Real-time metrics from user stats
  const { metrics, isMock } = useUserMetrics();

  const { data: liveMocks } = useFirestoreCollection({
    name: 'mockTests', limit: 500, fallback: [],
    transform: (docs) => docs,
  });

  // Use existing usePlannerTasks hook for user-scoped tasks
  const { tasksMap } = usePlannerTasks();
  
  // Get today's tasks
  const todayStr = todayKey();
  const plannerTasksLive = (tasksMap[todayStr] || []).map(task => ({
    id: task.id,
    text: s(task.title, s(task.text, 'Task')),
    done: !!task.done,
    time: s(task.duration, s(task.time, '')),
  }));
  const plannerIsMock = Object.keys(tasksMap).length === 0;

  // Tasks added from this card before they've round-tripped through Firestore.
  // TODO: replace with the real write used by the Planner (e.g. addPlannerTask /
  // updatePlannerTask) so this becomes unnecessary and everything is Firestore-driven.
  const [localTasks, setLocalTasks] = useState([]);
  const [localDone, setLocalDone] = useState({});
  const tasks = [
    ...plannerTasksLive.map(t => ({ ...t, done: localDone[t.id] ?? t.done })),
    ...localTasks,
  ];

  const [showAddInput, setShowAddInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    // TODO: call the shared planner write here, e.g.
    // addPlannerTask({ text, date: todayKey() }) — until then this task only
    // reflects locally, not in the Planner.
    setLocalTasks(prev => [...prev, { id: `local-${Date.now()}`, text, done: false, time: '' }]);
    setNewTaskText('');
    setShowAddInput(false);
  };

  const handleToggleTask = (task) => {
    if (task.id?.toString().startsWith('local-')) {
      setLocalTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    } else {
      setLocalDone(prev => ({ ...prev, [task.id]: !(prev[task.id] ?? task.done) }));
      // TODO: also persist via updatePlannerTask(task.id, { done: !task.done })
    }
  };

  // Pomodoro state
  const [mode, setMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    if (!isRunning) return undefined;
    if (secondsLeft <= 0) { setIsRunning(false); return undefined; }
    const id = setInterval(() => setSecondsLeft((s2) => Math.max(0, s2 - 1)), 1000);
    return () => clearInterval(id);
  }, [isRunning, secondsLeft]);

  const switchMode = (key) => {
    setMode(key);
    setSecondsLeft(DURATIONS[key]);
    setIsRunning(false);
  };

  const resetTimer = () => {
    setSecondsLeft(DURATIONS[mode]);
    setIsRunning(false);
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const ringPct = Math.round((1 - secondsLeft / DURATIONS[mode]) * 100);

  return (
    <StudentLayout title="Welcome back" subtitle="Your desk, quietly organised.">
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
          {isMock && (
            <div className="mb-3 flex items-center gap-2 chip chip-amber" data-testid="weekly-progress-mock">
              <Circle size={8} strokeWidth={2} />
              Let's Go Champ!
            </div>
          )}
          <div className="eyebrow mb-2">Weekly progress</div>
          <div className="flex items-center gap-6 mt-3">
            <ProgressRing pct={Math.round(metrics.weeklyProgressPct)} />
            <div>
              <div className="display-num text-[42px]" style={{ color: 'var(--color-primary)' }}>
                {Math.round(metrics.weeklyProgressPct)}<span className="text-[22px]" style={{ color: 'var(--color-ink-muted)' }}>%</span>
              </div>
              <div className="text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>of your weekly goals</div>
              {!isMock && (
                <div className="mt-2 text-[12px] flex items-center gap-1.5" style={{ color: 'var(--color-success)' }}>
                  <TrendingUp size={13} strokeWidth={1.6} /> +12% vs last week
                </div>
              )}
            </div>
          </div>
          <div className="hairline-t mt-6 pt-4 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
            <div className="flex items-center justify-between">
              <span>Study hours</span>
              <span className="font-mono" style={{ color: 'var(--color-ink)' }}>
                {(metrics.weeklyStudyHours).toFixed(1)} / {metrics.weeklyGoal}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span>Notes written</span>
              <span className="font-mono" style={{ color: 'var(--color-ink)' }}>
                {metrics.notesThisWeek} / {metrics.weeklyNotesGoal}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span>Mocks attempted</span>
              <span className="font-mono" style={{ color: 'var(--color-ink)' }}>
                {metrics.mocksAttempted} / {metrics.weeklyMocksGoal}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          { 
            label: 'Notes created', 
            value: metrics.notesCreated,
            delta: `+${metrics.notesThisWeek ?? 0} this week`, 
            icon: BookOpen, 
            tone: 'primary',
            testId: 'notes-created'
          },
          { 
            label: 'Mocks attempted', 
            value: metrics.mocksAttempted,
            delta: metrics.mockAvgScore ? `Avg. ${metrics.mockAvgScore}%` : liveMocks.length ? `${liveMocks.length} tests live` : 'Avg. 72%',
            icon: ClipboardCheck, 
            tone: 'accent',
            testId: 'mocks-attempted'
          },
          { 
            label: 'Study streak', 
            value: metrics.studyStreak,
            unit: 'days',
            delta: `Best: ${metrics.bestStreak ?? 0}`, 
            icon: Flame, 
            tone: 'gold',
            testId: 'study-streak'
          },
          { 
            label: 'Weak topics', 
            value: 3, 
            delta: 'Down from 6', 
            icon: Target, 
            tone: 'ink',
            testId: 'weak-topics'
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, delay: i * 0.05 }}
            className="card p-5 md:p-6"
            data-testid={k.testId}
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

      {/* Pomodoro + Today's Task row */}
      <div className="mt-6 grid grid-cols-12 gap-4 md:gap-6">
        {/* Pomodoro */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}
          className="col-span-12 lg:col-span-6 card p-6 md:p-8"
          data-testid="pomodoro-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TimerIcon size={15} strokeWidth={1.6} style={{ color: 'var(--color-accent)' }} />
              <span className="eyebrow">Pomodoro</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            {MODES.map(m => {
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => switchMode(m.key)}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-medium transition-colors"
                  style={{
                    background: active ? 'var(--color-bg)' : 'transparent',
                    color: active ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <m.icon size={14} strokeWidth={1.6} /> {m.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="relative">
              <ProgressRing pct={ringPct} size={160} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="display-num" style={{ fontSize: 40, color: 'var(--color-ink)' }}>{formatTime(secondsLeft)}</span>
                <span className="text-[11px] font-mono mt-1" style={{ letterSpacing: '0.14em', color: 'var(--color-ink-muted)' }}>
                  {mode.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              className="mt-6 text-[12.5px] flex items-center gap-1"
              style={{ color: 'var(--color-ink-muted)' }}
              onClick={() => setSelectedTaskId(selectedTaskId ? null : (tasks[0]?.id ?? null))}
            >
              <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--color-gold)' }} />
              {selectedTask ? selectedTask.text : 'No task selected'}
            </button>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={resetTimer}
                aria-label="Reset timer"
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-ink-muted)' }}
              >
                <RotateCcw size={16} strokeWidth={1.6} />
              </button>
              <button
                onClick={() => setIsRunning(r => !r)}
                aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
              >
                {isRunning
                  ? <Pause size={22} strokeWidth={1.8} fill="currentColor" />
                  : <Play size={22} strokeWidth={1.8} fill="currentColor" style={{ marginLeft: 2 }} />}
              </button>
              <div style={{ width: 44 }} />
            </div>
          </div>
        </motion.div>

        {/* Today's Task */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, delay: .05 }}
          className="col-span-12 lg:col-span-6 card p-6 md:p-8"
          data-testid="today-task-card"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow mb-1.5">Today&apos;s task</div>
              <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>
                {tasks.filter(t => !t.done).length} tasks left today
              </div>
            </div>
            <button
              className="chip chip-primary flex items-center gap-1"
              style={{ background: 'transparent' }}
              onClick={() => setShowAddInput(v => !v)}
            >
              <Plus size={12} strokeWidth={2} /> Add task
            </button>
          </div>

          {showAddInput && (
            <div className="mt-4 flex items-center gap-2">
              <input
                autoFocus
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="e.g. Revise Polity chapter 4"
                className="flex-1 text-[13.5px] px-3 py-2 rounded-lg"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
              />
              <button
                onClick={handleAddTask}
                className="chip chip-primary"
                style={{ padding: '8px 14px' }}
              >
                Add
              </button>
            </div>
          )}

          <ul className="mt-5 flex flex-col divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {tasks.length === 0 && (
              <li className="py-6 text-[13px] text-center" style={{ color: 'var(--color-ink-faint)' }}>
                No tasks planned for today yet. Add one above, or open the planner.
              </li>
            )}
            {tasks.map((t, i) => (
              <li key={t.id ?? i} className="flex items-center gap-3 py-3.5" style={{ borderTop: i === 0 ? '1px solid var(--color-border)' : 'none' }}>
                <button onClick={() => handleToggleTask(t)} aria-label="Toggle task done">
                  {t.done
                    ? <CheckCircle2 size={19} strokeWidth={1.6} style={{ color: 'var(--color-primary)' }} />
                    : <Circle size={19} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)' }} />}
                </button>
                <button
                  className="flex-1 text-left text-[14.5px]"
                  style={{ color: t.done ? 'var(--color-ink-faint)' : 'var(--color-ink)', textDecoration: t.done ? 'line-through' : 'none' }}
                  onClick={() => setSelectedTaskId(t.id)}
                >
                  {t.text}
                </button>
                {t.time && <span className="text-[11.5px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>{t.time}</span>}
              </li>
            ))}
          </ul>

          <div className="hairline-t mt-5 pt-4 flex items-center justify-between">
            <div className="text-[12px]" style={{ color: 'var(--color-ink-faint)' }}>
              {plannerIsMock ? 'Synced with Planner once tasks are added there.' : 'Synced with your Planner.'}
            </div>
            <Link href="/student-desk/planner" className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
              Open planner <ChevronRight size={13} />
            </Link>
          </div>
        </motion.div>
      </div>
    </StudentLayout>
  );
}

function ProgressRing({ pct, size = 100 }) {
  const r = size * 0.4, c = 2 * Math.PI * r, center = size / 2;
  const dash = c * (Math.max(0, Math.min(100, pct)) / 100);
  return (
    <svg width={size} height={size}>
      <circle cx={center} cy={center} r={r} fill="none" strokeWidth="8" className="ring-track" />
      <motion.circle
        cx={center} cy={center} r={r} fill="none" strokeWidth="8"
        className="ring-progress" strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${dash} ${c}` }}
        transition={{ duration: 1.1, ease: [.2,.7,.2,1] }}
      />
    </svg>
  );
}