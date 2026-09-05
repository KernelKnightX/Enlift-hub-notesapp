import { useEffect, useMemo, useState } from 'react';
import StudentLayout from '@/layouts/StudentLayout';
import { useAuth } from '@/contexts/AuthContext';
import useFirestoreCollection from '@/hooks/shared/useFirestoreCollection';
import { usePlannerTasks } from '@/hooks/student/usePlannerTasks';
import useStudyPlan from '@/hooks/student/useStudyPlan';
import TaskModal from '@/components/planner/TaskModal';
import {
  Plus, ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle,
  RotateCcw, Sparkles, CalendarDays, Target,
} from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const priorityClass = { high: 'high', med: 'med', medium: 'medium', low: 'low' };

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

const formatDayLabel = (date) =>
  date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

function ProgressRing({ pct, size = 100, track = 'rgba(255,255,255,0.12)', stroke = '#fff' }) {
  const r = size * 0.38;
  const c = 2 * Math.PI * r;
  const center = size / 2;
  const dash = c * (Math.max(0, Math.min(100, pct)) / 100);

  return (
    <svg width={size} height={size}>
      <circle cx={center} cy={center} r={r} fill="none" strokeWidth="7" stroke={track} />
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        strokeWidth="7"
        stroke={stroke}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        strokeDasharray={`${dash} ${c}`}
      />
    </svg>
  );
}

export default function PlannerPage() {
  const { user } = useAuth();
  const todayKey = formatDateKey(new Date());

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);

  const noteWhere = user?.uid ? [['userId', '==', user.uid]] : [];
  const { data: userNotes } = useFirestoreCollection({ name: 'userNotes', where: noteWhere, fallback: [] });
  const { data: userPyqs } = useFirestoreCollection({ name: 'pyqs', orderBy: ['year', 'desc'], limit: 200, fallback: [] });
  const { tasksMap, saveTask, deleteTask } = usePlannerTasks();
  const {
    plansMap,
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

  useEffect(() => {
    if (!weekKeys.includes(selectedDayKey)) {
      setSelectedDayKey(weekKeys.includes(todayKey) ? todayKey : weekKeys[0]);
    }
  }, [weekKeys, selectedDayKey, todayKey]);

  const allManualTasks = useMemo(
    () => weekKeys.flatMap((key) => tasksMap[key] || []),
    [tasksMap, weekKeys],
  );

  const planTasksWeek = useMemo(
    () => weekKeys.flatMap((key) => (plansMap[key]?.tasks || []).map((t, i) => ({ ...t, dateKey: key, taskIndex: i }))),
    [weekKeys, plansMap],
  );

  const allTasksCount = allManualTasks.length + planTasksWeek.length;
  const doneCount =
    allManualTasks.filter((t) => t.done).length +
    planTasksWeek.filter((t) => t.done).length;
  const progressPct = Math.round((doneCount / Math.max(allTasksCount, 1)) * 100);

  const todayPlanDone = todayTasks.filter((t) => t.done).length;
  const selectedDate = weekDates[weekKeys.indexOf(selectedDayKey)] || weekDates[0];
  const selectedManual = tasksMap[selectedDayKey] || [];
  const selectedPlan = plansMap[selectedDayKey]?.tasks || [];
  const selectedTotal = selectedManual.length + selectedPlan.length;
  const selectedDone =
    selectedManual.filter((t) => t.done).length +
    selectedPlan.filter((t) => t.done).length;

  const weekLabel = `${weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  const weekBadge = weekOffset === 0 ? 'This week' : weekOffset > 0 ? `+${weekOffset} week` : `${weekOffset} week`;

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
    await updateSettings({ dailyStudyHours: Number(e.target.value) });
  };

  const getDayCount = (dateKey) => {
    const manual = (tasksMap[dateKey] || []).length;
    const plan = (plansMap[dateKey]?.tasks || []).length;
    return manual + plan;
  };

  return (
    <StudentLayout title="Study Planner" plainHeader>
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

      <div className="planner-desk">
        {/* Hero */}
        <section className="planner-hero">
          <div className="planner-hero__mesh" aria-hidden />
          <div className="planner-hero__inner">
            <div className="planner-hero__left">
              <div className="planner-hero__eyebrow">Study planner</div>
              <h1 className="planner-hero__title">{weekLabel}</h1>
              <p className="planner-hero__sub">
                {doneCount} of {allTasksCount} tasks completed · {weekBadge}
              </p>
              <div className="planner-hero__nav">
                <button
                  type="button"
                  className="planner-hero__nav-btn"
                  onClick={() => setWeekOffset((w) => w - 1)}
                  aria-label="Previous week"
                  data-testid="week-prev"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="planner-hero__week-tag">{weekBadge}</span>
                <button
                  type="button"
                  className="planner-hero__nav-btn"
                  onClick={() => setWeekOffset((w) => w + 1)}
                  aria-label="Next week"
                  data-testid="week-next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="planner-hero__ring">
              <div className="relative">
                <ProgressRing pct={progressPct} size={96} />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  data-testid="progress-ring"
                >
                  <span className="planner-hero__ring-pct">{progressPct}%</span>
                </div>
              </div>
              <span className="planner-hero__ring-label">Week complete</span>
            </div>

            <div className="planner-hero__actions">
              <button
                type="button"
                className="planner-hero__btn planner-hero__btn--solid"
                onClick={() => openModal(selectedDayKey)}
                data-testid="add-task"
              >
                <Plus size={15} strokeWidth={2} /> New task
              </button>
              <button
                type="button"
                className="planner-hero__btn planner-hero__btn--ghost"
                disabled={generating}
                onClick={() => replan(todayKey)}
              >
                <RotateCcw size={14} /> {generating ? 'Working…' : 'Replan today'}
              </button>
            </div>
          </div>
        </section>

        {/* Day picker */}
        <div className="planner-days" role="tablist" aria-label="Select day">
          {weekDates.map((date, i) => {
            const dateKey = formatDateKey(date);
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDayKey;
            const count = getDayCount(dateKey);

            return (
              <button
                key={dateKey}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={[
                  'planner-day-pill',
                  isSelected && 'is-selected',
                  isToday && 'is-today',
                  i >= 5 && 'is-weekend',
                ].filter(Boolean).join(' ')}
                onClick={() => setSelectedDayKey(dateKey)}
              >
                <div className="planner-day-pill__dow">{DAYS[i]}</div>
                <div className="planner-day-pill__num">{date.getDate()}</div>
                {count > 0 && <span className="planner-day-pill__count">{count}</span>}
              </button>
            );
          })}
        </div>

        <div className="planner-body">
          {/* Day focus */}
          <div>
            <div className="planner-focus" data-testid="planner-week">
              <div className="planner-focus__head">
                <div>
                  <h2 className="planner-focus__date">{formatDayLabel(selectedDate)}</h2>
                  <p className="planner-focus__meta">
                    {selectedDone}/{selectedTotal} tasks done
                    {selectedDayKey === todayKey && ' · Today'}
                  </p>
                </div>
                <button
                  type="button"
                  className="planner-focus__add"
                  onClick={() => openModal(selectedDayKey)}
                  data-testid={`add-task-${selectedDayKey}`}
                >
                  <Plus size={14} /> Add task
                </button>
              </div>

              <div className="planner-focus__content">
                {selectedTotal === 0 ? (
                  <div className="planner-empty-state">
                    <div className="planner-empty-state__icon">
                      <CalendarDays size={22} strokeWidth={1.6} />
                    </div>
                    <h3 className="planner-empty-state__title">Nothing scheduled</h3>
                    <p className="planner-empty-state__text">
                      Add a manual task or generate today&apos;s AI plan from the sidebar.
                    </p>
                    <button
                      type="button"
                      className="planner-empty-state__btn"
                      onClick={() => openModal(selectedDayKey)}
                    >
                      <Plus size={14} /> Add your first task
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedPlan.length > 0 && (
                      <div className="planner-section">
                        <div className="planner-section__label planner-section__label--ai">
                          AI generated
                        </div>
                        <div className="planner-timeline">
                          {selectedPlan.map((t, planIdx) => (
                            <button
                              key={`plan-${selectedDayKey}-${planIdx}`}
                              type="button"
                              className="planner-block planner-block--ai"
                              onClick={() => toggleTask(selectedDayKey, planIdx, !t.done)}
                            >
                              <div className="planner-block__dot">
                                {t.done ? (
                                  <CheckCircle2 size={14} style={{ color: '#5b21b6' }} />
                                ) : (
                                  <Circle size={14} style={{ color: '#a78bfa' }} />
                                )}
                              </div>
                              <div className="planner-block__card">
                                <div className="planner-block__top">
                                  <span className="planner-block__badge planner-block__badge--ai">AI</span>
                                  <span className="planner-block__time">{t.estMinutes}m · {t.type}</span>
                                </div>
                                <div className={`planner-block__title${t.done ? ' is-done' : ''}`}>
                                  {t.subject}: {t.topic}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedManual.length > 0 && (
                      <div className="planner-section">
                        <div className="planner-section__label">Your tasks</div>
                        <div className="planner-timeline">
                          {selectedManual.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              className={`planner-block planner-block--${priorityClass[t.priority] || 'low'}`}
                              onClick={() => openModal(selectedDayKey, t)}
                              data-testid={`task-${t.id}`}
                            >
                              <div className="planner-block__dot">
                                {t.done ? (
                                  <CheckCircle2 size={14} style={{ color: 'var(--color-primary)' }} />
                                ) : (
                                  <Circle size={14} style={{ color: 'var(--color-border-strong)' }} />
                                )}
                              </div>
                              <div className="planner-block__card">
                                <div className="planner-block__top">
                                  <span className="planner-block__badge planner-block__badge--manual">
                                    {t.chip || t.taskType || 'Task'}
                                  </span>
                                  <span className="planner-block__time">
                                    <Clock size={10} /> {t.time || '—'}
                                  </span>
                                </div>
                                <div className={`planner-block__title${t.done ? ' is-done' : ''}`}>
                                  {t.title || 'Untitled task'}
                                </div>
                                {t.duration && (
                                  <div className="planner-block__sub">{t.duration} min</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Week overview dots */}
            <div className="planner-overview">
              <div className="planner-overview__title">Week at a glance</div>
              <div className="planner-overview__grid">
                {weekDates.map((date, i) => {
                  const dateKey = formatDateKey(date);
                  const manual = tasksMap[dateKey] || [];
                  const plan = plansMap[dateKey]?.tasks || [];
                  const all = [...manual, ...plan];
                  const isSelected = dateKey === selectedDayKey;
                  const isToday = dateKey === todayKey;

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      className={[
                        'planner-overview__cell',
                        isSelected && 'is-selected',
                        isToday && 'is-today',
                      ].filter(Boolean).join(' ')}
                      onClick={() => setSelectedDayKey(dateKey)}
                      title={DAYS[i]}
                    >
                      <span className="planner-overview__dow">{DAYS_SHORT[i]}</span>
                      <span className="planner-overview__num">{date.getDate()}</span>
                      {all.length > 0 && (
                        <span className="planner-overview__dots">
                          {all.slice(0, 3).map((t, j) => (
                            <span
                              key={j}
                              className={`planner-overview__dot${t.done ? ' is-done' : ''}`}
                            />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="planner-side">
            <div className="planner-side-card planner-side-card--ai" data-testid="today-study-plan">
              <div className="planner-side-card__head">
                <div className="planner-side-card__eyebrow">
                  <Sparkles size={12} /> Today&apos;s AI plan
                </div>
                <h2 className="planner-side-card__title">
                  {todayPlanDone}/{todayTasks.length || 0} completed
                </h2>
              </div>
              <div className="planner-side-card__body">
                <div className="planner-side-actions">
                  <label className="planner-side-hours">
                    Hours
                    <input
                      type="number"
                      min={1}
                      max={12}
                      step={0.5}
                      value={settings?.dailyStudyHours ?? 4}
                      onChange={handleHoursChange}
                    />
                  </label>
                  <button
                    type="button"
                    className="planner-side-replan"
                    disabled={generating}
                    onClick={() => replan(todayKey)}
                  >
                    <RotateCcw size={13} /> Replan
                  </button>
                </div>

                {planLoading ? (
                  <p className="planner-side-empty">Loading plan…</p>
                ) : todayTasks.length === 0 ? (
                  <p className="planner-side-empty">
                    No AI plan yet. Set your hours and hit Replan.
                  </p>
                ) : (
                  todayTasks.map((task, i) => (
                    <button
                      key={`${task.subject}-${task.topic}-${i}`}
                      type="button"
                      className="planner-side-task"
                      onClick={() => toggleTask(todayKey, i, !task.done)}
                    >
                      {task.done ? (
                        <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                      ) : (
                        <Circle size={15} style={{ flexShrink: 0, marginTop: 2, opacity: 0.5 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={`planner-side-task__title${task.done ? ' is-done' : ''}`}>
                          {task.subject}: {task.topic}
                        </div>
                        <div className="planner-side-task__meta">
                          {task.estMinutes}m · {task.type}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="planner-side-card" data-testid="planner-side">
              <div className="planner-side-card__head">
                <div className="planner-side-card__eyebrow">
                  <Target size={12} /> Schedule
                </div>
                <h2 className="planner-side-card__title">Your targets</h2>
              </div>
              <div className="planner-stats">
                <div className="planner-stat">
                  <span>Exam date</span>
                  <strong>{settings?.examDate || '2027-06-06'}</strong>
                </div>
                <div className="planner-stat">
                  <span>Daily study</span>
                  <strong>{settings?.dailyStudyHours || 4}h</strong>
                </div>
                <div className="planner-stat">
                  <span>Week progress</span>
                  <strong data-testid="mocks-attempted">{progressPct}%</strong>
                </div>
                <div className="planner-stat__bar">
                  <div className="planner-stat__fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </StudentLayout>
  );
}
