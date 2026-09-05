import { useMemo, useState } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';
import { usePlannerTasks } from '@/hooks/student/usePlannerTasks';
import useStudyPlan from '@/hooks/student/useStudyPlan';
import TaskModal from '@/components/planner/TaskModal';
import {
  Plus, ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle, RotateCcw, Sparkles,
} from 'lucide-react';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const priorityColor = { high: 'var(--color-accent)', med: 'var(--color-gold)', low: 'var(--color-primary)' };
const planTypeColor = {
  'mistake-review': 'var(--color-accent)',
  revision: 'var(--color-gold)',
  new: 'var(--color-primary)',
};

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
  const {
    plansMap,
    todayKey,
    todayTasks,
    settings,
    loading: planLoading,
    generating,
    replan,
    updateSettings,
    toggleTask,
  } = useStudyPlan(weekOffset);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekKeys = useMemo(() => weekDates.map((d) => formatDateKey(d)), [weekDates]);
  const weekTasks = useMemo(() => weekKeys.map((key) => tasksMap[key] || []), [tasksMap, weekKeys]);
  const allManualTasks = useMemo(() => weekTasks.flat(), [weekTasks]);

  const planTasksWeek = useMemo(
    () => weekKeys.flatMap((key) => (plansMap[key]?.tasks || []).map((t, i) => ({ ...t, dateKey: key, taskIndex: i }))),
    [weekKeys, plansMap]
  );

  const allTasksCount = allManualTasks.length + planTasksWeek.length;
  const doneCount =
    allManualTasks.filter((t) => t.done).length +
    planTasksWeek.filter((t) => t.done).length;
  const total = Math.max(allTasksCount, 1);

  const todayPlanDone = todayTasks.filter((t) => t.done).length;

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

  const handleHoursChange = async (e) => {
    const hours = Number(e.target.value);
    await updateSettings({ dailyStudyHours: hours });
  };

  return (
    <StudentLayout title="Study Planner">
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

      {/* Today's generated plan */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 md:p-8 mb-6"
        data-testid="today-study-plan"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
              <span className="eyebrow">Today&apos;s generated plan</span>
            </div>
            <h2 className="mt-2 font-serif text-[22px]" style={{ letterSpacing: '-0.02em' }}>
              {todayPlanDone}/{todayTasks.length || 0} tasks done
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
              Weak topics weighted 1.5× · mistake reviews scheduled first
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[12px] flex items-center gap-2" style={{ color: 'var(--color-ink-muted)' }}>
              Daily hours
              <input
                type="number"
                min={1}
                max={12}
                step={0.5}
                value={settings?.dailyStudyHours ?? 4}
                onChange={handleHoursChange}
                className="w-16 px-2 py-1 rounded-lg text-center"
                style={{ border: '1px solid var(--color-border)' }}
              />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              disabled={generating}
              onClick={() => replan(todayKey)}
              style={{ fontSize: 12.5, padding: '0.55rem 1rem' }}
            >
              <RotateCcw size={14} /> {generating ? 'Replanning…' : 'Replan today'}
            </button>
          </div>
        </div>

        {planLoading ? (
          <p className="mt-6 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>Loading plan…</p>
        ) : todayTasks.length === 0 ? (
          <p className="mt-6 text-[14px]" style={{ color: 'var(--color-ink-muted)' }}>
            No plan yet — hit Replan to generate from your weaknesses and syllabus progress.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-2">
            {todayTasks.map((task, i) => (
              <button
                key={`${task.subject}-${task.topic}-${i}`}
                type="button"
                onClick={() => toggleTask(todayKey, i, !task.done)}
                className="flex items-center gap-3 p-3 rounded-xl text-left w-full"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {task.done ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Circle size={16} style={{ color: 'var(--color-border-strong)' }} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium" style={{
                    textDecoration: task.done ? 'line-through' : 'none',
                    color: task.done ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                  }}>
                    {task.subject}: {task.topic}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>
                    {task.estMinutes}m · {task.type}
                  </div>
                </div>
                <span className="chip" style={{ fontSize: 9, padding: '2px 6px' }}>{task.type}</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 lg:col-span-8 card p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow mb-1">Week of {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
              <div className="font-serif text-[22px]" style={{ letterSpacing: '-0.01em' }}>
                Manual + generated — {doneCount}/{allTasksCount} tasks done.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                onClick={() => setWeekOffset((w) => w - 1)}
                data-testid="week-prev"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
              </button>
              <span className="text-[12px] font-mono px-2" style={{ color: 'var(--color-ink-muted)' }}>
                {weekOffset === 0 ? 'This week' : weekOffset > 0 ? `+${weekOffset} wk` : `${weekOffset} wk`}
              </span>
              <button
                className="p-2 rounded-xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                onClick={() => setWeekOffset((w) => w + 1)}
                data-testid="week-next"
              >
                <ChevronRight size={16} strokeWidth={1.5} />
              </button>
              <button
                className="btn btn-primary"
                onClick={() => openModal(selectedDateKey)}
                style={{ padding: '0.55rem 1rem', fontSize: 12.5 }}
                data-testid="add-task"
              >
                <Plus size={14} /> New task
              </button>
            </div>
          </div>
          <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <div style={{ width: `${(doneCount / total) * 100}%`, height: '100%', background: 'var(--color-primary)' }} />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 card p-6" data-testid="planner-side">
          <div className="eyebrow mb-2">Plan settings</div>
          <div className="text-[13px] space-y-2" style={{ color: 'var(--color-ink-muted)' }}>
            <p>Exam date: <strong style={{ color: 'var(--color-ink)' }}>{settings?.examDate || '2027-06-06'}</strong></p>
            <p>Daily budget: <strong style={{ color: 'var(--color-ink)' }}>{settings?.dailyStudyHours || 4}h</strong></p>
            <p className="text-[12px] leading-relaxed">
              Missed generated tasks roll forward on replan. Completed tasks are not repeated.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3" data-testid="planner-week">
        {weekDates.map((date, i) => {
          const dateKey = formatDateKey(date);
          const dayTasks = tasksMap[dateKey] || [];
          const dayPlan = plansMap[dateKey]?.tasks || [];
          const isToday = dateKey === formatDateKey(new Date());

          return (
            <div
              key={dateKey}
              className="rounded-2xl p-3"
              style={{
                background: isToday ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                border: `1px solid ${isToday ? 'var(--color-primary)' : 'var(--color-border)'}`,
                minHeight: 280,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.14em' }}>{DAYS[i]}</div>
                  <div className="font-serif text-[16px] mt-0.5" style={{ letterSpacing: '-0.01em' }}>{date.getDate()}</div>
                </div>
                {isToday && <span className="chip chip-accent" style={{ padding: '2px 8px', fontSize: 9 }}>Today</span>}
              </div>
              <div className="flex flex-col gap-2">
                {dayPlan.map((t, planIdx) => (
                  <motion.button
                    key={`plan-${dateKey}-${planIdx}`}
                    type="button"
                    layout
                    onClick={() => toggleTask(dateKey, planIdx, !t.done)}
                    className="text-left p-2.5 rounded-xl"
                    style={{
                      background: 'var(--color-primary-tint)',
                      border: '1px solid rgba(77,56,245,0.2)',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        style={{
                          width: 4,
                          height: 28,
                          borderRadius: 999,
                          background: planTypeColor[t.type] || 'var(--color-primary)',
                          flexShrink: 0,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>
                          {t.estMinutes}m · {t.type}
                        </div>
                        <div
                          className="mt-0.5 text-[11.5px] font-medium leading-tight"
                          style={{
                            color: t.done ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                            textDecoration: t.done ? 'line-through' : 'none',
                          }}
                        >
                          {t.subject}: {t.topic}
                        </div>
                      </div>
                      {t.done ? (
                        <CheckCircle2 size={12} style={{ color: 'var(--color-primary)' }} />
                      ) : (
                        <Circle size={12} style={{ color: 'var(--color-border-strong)' }} />
                      )}
                    </div>
                  </motion.button>
                ))}

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
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        style={{
                          width: 4,
                          height: 32,
                          borderRadius: 999,
                          background: priorityColor[t.priority] || 'var(--color-primary)',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono" style={{ color: 'var(--color-ink-muted)' }}>
                          <Clock size={10} strokeWidth={1.5} /> {t.time || '—'}
                        </div>
                        <div
                          className="mt-1 text-[12.5px] font-medium leading-tight"
                          style={{
                            color: t.done ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                            textDecoration: t.done ? 'line-through' : 'none',
                          }}
                        >
                          {t.title || 'Untitled task'}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className="chip" style={{ padding: '1px 6px', fontSize: 9 }}>{t.chip || t.taskType || 'Task'}</span>
                          {t.done ? (
                            <CheckCircle2 size={13} strokeWidth={1.6} style={{ color: 'var(--color-primary)', marginLeft: 'auto' }} />
                          ) : (
                            <Circle size={13} strokeWidth={1.5} style={{ color: 'var(--color-border-strong)', marginLeft: 'auto' }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
                <button
                  className="p-2 rounded-xl text-[11.5px] flex items-center justify-center gap-1"
                  style={{ background: 'transparent', border: '1px dashed var(--color-border-strong)', color: 'var(--color-ink-muted)' }}
                  onClick={() => openModal(dateKey)}
                  data-testid={`add-task-${dateKey}`}
                >
                  <Plus size={13} strokeWidth={1.5} /> Add manual
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </StudentLayout>
  );
}
