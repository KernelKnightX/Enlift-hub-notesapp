import { useState } from 'react';
import StudentLayout from '../../../components/StudentLayout';
import { motion } from 'framer-motion';
import {
  Plus, ChevronLeft, ChevronRight, Flag, Clock, CheckCircle2, Circle, Calendar as CalIcon, MoreHorizontal
} from 'lucide-react';

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

const TASKS_INIT = [
  { id:1, day:'MON', time:'07:30', title:'The Morning Brief',            priority:'low',  chip:'CA',      done:true  },
  { id:2, day:'MON', time:'09:00', title:'Modern History — 1857 revolt', priority:'med',  chip:'History', done:true  },
  { id:3, day:'TUE', time:'09:00', title:'Prelims Mock #12',              priority:'high', chip:'Mock',    done:false },
  { id:4, day:'TUE', time:'16:00', title:'Answer Writing GS-II Q3',       priority:'med',  chip:'Mains',   done:false },
  { id:5, day:'WED', time:'10:00', title:'Environment — IPCC AR6 primer',priority:'med',  chip:'Env',     done:false },
  { id:6, day:'THU', time:'09:30', title:'Polity — DPSPs revision',       priority:'low',  chip:'Polity',  done:false },
  { id:7, day:'FRI', time:'11:00', title:'Weekly Revision',                priority:'med',  chip:'Rev',     done:false },
  { id:8, day:'SAT', time:'09:30', title:'Sectional Mock: Polity',        priority:'high', chip:'Mock',    done:false },
];

const priorityColor = { high:'var(--color-accent)', med:'var(--color-gold)', low:'var(--color-primary)' };

export default function PlannerPage() {
  const [tasks, setTasks] = useState(TASKS_INIT);
  const [weekOffset, setWeekOffset] = useState(0);

  const toggle = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const doneCount = tasks.filter(t => t.done).length;
  const total = tasks.length;

  return (
    <StudentLayout title="Weekly Planner" subtitle="A canvas for your prep — priorities, hours, and progress.">
      {/* Overview */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8 card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">Week 04 · Jan 2026</div>
              <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>
                A quiet, focused week — {doneCount}/{total} tasks done.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                      onClick={() => setWeekOffset(w => w - 1)} data-testid="week-prev">
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <span className="text-[12px] font-mono px-2" style={{ color: 'var(--color-ink-muted)' }}>
                {weekOffset === 0 ? 'This week' : weekOffset > 0 ? `+${weekOffset} wk` : `${weekOffset} wk`}
              </span>
              <button className="p-2 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                      onClick={() => setWeekOffset(w => w + 1)} data-testid="week-next">
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
              <button className="btn btn-primary" style={{ padding: '0.55rem 1rem', fontSize: 12.5 }} data-testid="add-task">
                <Plus size={14} /> New task
              </button>
            </div>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <div style={{ width: `${(doneCount / total) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 card p-6" data-testid="planner-side">
          <div className="eyebrow mb-2">Study hours this week</div>
          <div className="display-num text-[42px]" style={{ color: 'var(--color-primary)' }}>26<span className="text-[22px]" style={{ color: 'var(--color-ink-muted)' }}>/40h</span></div>
          <div className="mt-3 flex items-end gap-1.5 h-[46px]">
            {[4, 5, 3, 6, 5, 2, 1].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md" style={{ height: `${(h/6)*100}%`, background: i === 6 ? 'var(--color-accent)' : 'var(--color-primary)' }} />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>
            {DAYS.map(d => <span key={d}>{d[0]}</span>)}
          </div>
        </div>
      </div>

      {/* Kanban week */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3" data-testid="planner-week">
        {DAYS.map((d, i) => {
          const dayTasks = tasks.filter(t => t.day === d);
          const isToday = i === 1; // demo
          return (
            <div key={d} className="rounded-2xl p-3"
                 style={{
                   background: isToday ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                   border: `1px solid ${isToday ? 'var(--color-primary)' : 'var(--color-border)'}`,
                   minHeight: 260
                 }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.14em' }}>{d}</div>
                  <div className="font-serif text-[16px] mt-0.5" style={{ letterSpacing: '-0.01em' }}>{20 + i}</div>
                </div>
                {isToday && <span className="chip chip-accent" style={{ padding: '2px 8px', fontSize: 9 }}>Today</span>}
              </div>
              <div className="flex flex-col gap-2">
                {dayTasks.map(t => (
                  <motion.button
                    key={t.id}
                    onClick={() => toggle(t.id)}
                    layout
                    className="text-left p-3 rounded-xl group"
                    data-testid={`task-${t.id}`}
                    style={{
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      transition: 'border-color .15s ease'
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div style={{
                        width: 4, height: 32, borderRadius: 999, background: priorityColor[t.priority], flexShrink: 0, marginTop: 2
                      }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>
                          <Clock size={10} strokeWidth={1.5} /> {t.time}
                        </div>
                        <div className="mt-1 text-[12.5px] font-medium leading-tight" style={{
                          color: t.done ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                          textDecoration: t.done ? 'line-through' : 'none'
                        }}>{t.title}</div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className="chip" style={{ padding: '1px 6px', fontSize: 9 }}>{t.chip}</span>
                          {t.done ? <CheckCircle2 size={13} strokeWidth={1.6} style={{ color: 'var(--color-primary)', marginLeft: 'auto' }} />
                                  : <Circle size={13} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)', marginLeft: 'auto' }} />}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
                <button className="p-2 rounded-xl text-[11.5px] flex items-center justify-center gap-1"
                        style={{ background: 'transparent', border: '1px dashed var(--color-border-strong)', color: 'var(--color-ink-muted)' }}
                        data-testid={`add-task-${d}`}>
                  <Plus size={13} strokeWidth={1.5} /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </StudentLayout>
  );
}
