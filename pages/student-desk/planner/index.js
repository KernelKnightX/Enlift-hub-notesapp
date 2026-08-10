import { useMemo, useState } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import useFirestoreCollection from '@/hooks/useFirestoreCollection';
import { usePlannerTasks } from '@/hooks/usePlannerTasks';
import TaskModal from '@/components/planner/TaskModal';
import {
  Plus, ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle
} from 'lucide-react';

const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
const priorityColor = { high:'var(--color-accent)', med:'var(--color-gold)', low:'var(--color-primary)' };

const getMonday = (date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  return copy;
};

const getWeekDates = (weekOffset) => {
  const start = getMonday(new Date());
  start.setDate(start.getDate() + weekOffset * 7);
  return DAYS.map((_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return d;
  });
};

const formatDateKey = (date) => date.toISOString().slice(0, 10);

export default function PlannerPage() {
  const { user } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDateKey, setSelectedDateKey] = useState(formatDateKey(new Date()));

  const noteWhere = user?.uid ? [['userId', '==', user.uid]] : [];
  const { data: userNotes } = useFirestoreCollection({ name: 'userNotes', where: noteWhere, fallback: [] });
  const { data: userPyqs } = useFirestoreCollection({ name: 'pyqs', orderBy: ['year', 'desc'], limit: 200, fallback: [] });
  const { tasksMap, saveTask, deleteTask } = usePlannerTasks();

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekKeys = useMemo(() => weekDates.map(d => formatDateKey(d)), [weekDates]);
  const weekTasks = useMemo(() => weekKeys.map(key => tasksMap[key] || []), [tasksMap, weekKeys]);
  const allTasks = useMemo(() => weekTasks.flat(), [weekTasks]);

  const doneCount = allTasks.filter(t => t.done).length;
  const total = Math.max(allTasks.length, 1);

  const openModal = (dateKey, task = null) => {
    setSelectedDateKey(dateKey);
    setSelectedTask(task);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTask(null);
  };

  const handleSave = async (task) => {
    await saveTask(task.dateKey || selectedDateKey, task);
    closeModal();
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    closeModal();
  };

  const toggleTaskDone = async (task) => {
    await saveTask(task.date, { ...task, done: !task.done, dateKey: task.date });
  };

  return (
    <StudentLayout title="Weekly Planner" subtitle="A canvas for your prep — priorities, hours, and progress.">
      <TaskModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        editTask={selectedTask}
        defaultDateKey={selectedDateKey}
        defaultTaskType={selectedTask?.taskType || 'study'}
        userNotes={userNotes}
        userPyqs={userPyqs}
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8 card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">Week of {weekDates[0].toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
              <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>
                A quiet, focused week — {doneCount}/{allTasks.length} tasks done.
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
              <button className="btn btn-primary" onClick={() => openModal(selectedDateKey)} style={{ padding: '0.55rem 1rem', fontSize: 12.5 }} data-testid="add-task">
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
              <div key={i} className="flex-1 rounded-t-md" style={{ height: `${(h/6)*100}%`, background: i === new Date().getDay() - 1 ? 'var(--color-accent)' : 'var(--color-primary)' }} />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>
            {DAYS.map(d => <span key={d}>{d[0]}</span>)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3" data-testid="planner-week">
        {weekDates.map((date, i) => {
          const dateKey = formatDateKey(date);
          const dayTasks = tasksMap[dateKey] || [];
          const isToday = dateKey === formatDateKey(new Date());

          return (
            <div key={dateKey} className="rounded-2xl p-3"
                 style={{
                   background: isToday ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                   border: `1px solid ${isToday ? 'var(--color-primary)' : 'var(--color-border)'}`,
                   minHeight: 260
                 }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.14em' }}>{DAYS[i]}</div>
                  <div className="font-serif text-[16px] mt-0.5" style={{ letterSpacing: '-0.01em' }}>{date.getDate()}</div>
                </div>
                {isToday && <span className="chip chip-accent" style={{ padding: '2px 8px', fontSize: 9 }}>Today</span>}
              </div>
              <div className="flex flex-col gap-2">
                {dayTasks.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => openModal(dateKey, t)}
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
                          <Clock size={10} strokeWidth={1.5} /> {t.time || '—'}
                        </div>
                        <div className="mt-1 text-[12.5px] font-medium leading-tight" style={{
                          color: t.done ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                          textDecoration: t.done ? 'line-through' : 'none'
                        }}>{t.title || 'Untitled task'}</div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className="chip" style={{ padding: '1px 6px', fontSize: 9 }}>{t.chip || t.taskType || 'Task'}</span>
                          {t.done ? <CheckCircle2 size={13} strokeWidth={1.6} style={{ color: 'var(--color-primary)', marginLeft: 'auto' }} />
                                  : <Circle size={13} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)', marginLeft: 'auto' }} />}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
                <button className="p-2 rounded-xl text-[11.5px] flex items-center justify-center gap-1"
                        style={{ background: 'transparent', border: '1px dashed var(--color-border-strong)', color: 'var(--color-ink-muted)' }}
                        onClick={() => openModal(dateKey)}
                        data-testid={`add-task-${dateKey}`}>
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
