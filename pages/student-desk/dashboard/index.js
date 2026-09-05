import { useEffect, useState } from "react";
import StudentLayout from "@/layouts/StudentLayout";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  BookOpen,
  Flame,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Brain,
  Coffee,
  Moon,
  ChevronRight,
  Newspaper,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import useUserMetrics from "@/hooks/student/useUserMetrics";
import { usePlannerTasks } from "@/hooks/student/usePlannerTasks";
import useStudyPlan from "@/hooks/student/useStudyPlan";
import { getDefaultExamCountdowns } from "@/lib/planning/examCountdowns";
import MistakesDueCard from "@/components/student/MistakesDueCard";
import WeaknessSummaryCard from "@/components/student/WeaknessSummaryCard";

const daysUntil = (d) =>
  Math.max(0, Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)));

const COUNTDOWNS = getDefaultExamCountdowns();

const QUICK_LINKS = [
  {
    label: "Study Notes",
    desc: "Read chapters",
    href: "/student-desk/notes",
    icon: BookOpen,
  },
  {
    label: "Mock Tests",
    desc: "Practice today",
    href: "/student-desk/mock-tests",
    icon: ClipboardCheck,
  },
  {
    label: "Current Affairs",
    desc: "Today's edition",
    href: "/student-desk/current-affairs",
    icon: Newspaper,
  },
  {
    label: "PYQ Papers",
    desc: "Past papers",
    href: "/student-desk/pyq",
    icon: FileText,
  },
];

const s = (v, fallback = "") => {
  if (v == null) return fallback;
  if (typeof v === "string" || typeof v === "number") return v;
  return fallback;
};

const DURATIONS = { focus: 25 * 60, break: 5 * 60, rest: 15 * 60 };
const MODES = [
  { key: "focus", label: "Focus", icon: Brain },
  { key: "break", label: "Break", icon: Coffee },
  { key: "rest", label: "Rest", icon: Moon },
];

const formatTime = (secs) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const sec = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${sec}`;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { metrics } = useUserMetrics();

  const firstName =
    user?.fullName?.split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    "there";

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const { tasksMap, saveTask } = usePlannerTasks();
  const { todayKey, todayTasks, toggleTask: togglePlanTask } = useStudyPlan();

  const manualTasks = (tasksMap[todayKey] || []).map((task) => ({
    id: task.id,
    source: "manual",
    text: s(task.title, s(task.text, "Task")),
    done: !!task.done,
    time: s(task.duration, s(task.time, "")),
    raw: task,
  }));

  const planTasks = (todayTasks || []).map((task, index) => ({
    id: `plan-${index}`,
    source: "plan",
    planIndex: index,
    text: task.topic
      ? `${task.subject}: ${task.topic}`
      : s(task.subject, "AI study block"),
    done: !!task.done,
    time: task.estMinutes ? `${task.estMinutes}m` : "",
  }));

  const tasks = [...manualTasks, ...planTasks];
  const hasPlannerData = manualTasks.length > 0 || planTasks.length > 0;
  const tasksLeft = tasks.filter((t) => !t.done).length;
  const weeklyPct = Math.round(metrics.weeklyProgressPct);

  const [showAddInput, setShowAddInput] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);

  const handleAddTask = async () => {
    const text = newTaskText.trim();
    if (!text || taskSaving) return;
    setTaskSaving(true);
    try {
      await saveTask(todayKey, { title: text, done: false, time: "" });
      setNewTaskText("");
      setShowAddInput(false);
    } catch (error) {
      console.error("[dashboard] Failed to add task:", error);
    } finally {
      setTaskSaving(false);
    }
  };

  const handleToggleTask = async (task) => {
    if (taskSaving) return;
    setTaskSaving(true);
    try {
      if (task.source === "plan") {
        await togglePlanTask(todayKey, task.planIndex, !task.done);
      } else {
        await saveTask(todayKey, {
          ...task.raw,
          id: task.id,
          title: task.text,
          done: !task.done,
        });
      }
    } catch (error) {
      console.error("[dashboard] Failed to toggle task:", error);
    } finally {
      setTaskSaving(false);
    }
  };

  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    if (!isRunning) return undefined;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      return undefined;
    }
    const id = setInterval(
      () => setSecondsLeft((s2) => Math.max(0, s2 - 1)),
      1000,
    );
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

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <StudentLayout title="Welcome back">
      <div className="dash-studio">
        {/* Briefing — light header, not profile dark hero */}
        <header className="dash-brief">
          <div>
            <h1 className="dash-brief__title">
              {getGreeting()}, {firstName}
            </h1>
            <p className="dash-brief__date">{todayLabel}</p>
          </div>
          <div className="dash-brief__chips">
            <span className="dash-chip dash-chip--streak" data-testid="study-streak">
              <Flame size={13} strokeWidth={2} />
              {metrics.studyStreak} day streak
            </span>
            <span className="dash-chip dash-chip--week" data-testid="progress-ring">
              {weeklyPct}% weekly goal
            </span>
          </div>
        </header>

        <div className="dash-layout">
          {/* Primary column — tasks & actions */}
          <div className="dash-primary">
            <div className="dash-card dash-card--tasks" data-testid="today-task-card">
              <div className="dash-card__head">
                <div>
                  <div className="dash-card__eyebrow">Today&apos;s plan</div>
                  <h2 className="dash-card__title">
                    {tasksLeft} task{tasksLeft === 1 ? "" : "s"} left
                  </h2>
                </div>
                <button
                  type="button"
                  className="chip chip-primary flex items-center gap-1"
                  style={{ background: "transparent", flexShrink: 0 }}
                  onClick={() => setShowAddInput((v) => !v)}
                >
                  <Plus size={12} strokeWidth={2} /> Add
                </button>
              </div>

              {showAddInput && (
                <div className="dash-task-add">
                  <input
                    autoFocus
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    placeholder="e.g. Revise Polity chapter 4"
                  />
                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="chip chip-primary"
                    style={{ padding: "8px 14px" }}
                    disabled={taskSaving}
                  >
                    {taskSaving ? "…" : "Add"}
                  </button>
                </div>
              )}

              <ul className="dash-task-list">
                {tasks.length === 0 && (
                  <li
                    className="py-6 text-[13px] text-center"
                    style={{ color: "var(--color-ink-faint)" }}
                  >
                    No tasks for today. Add one above or open the planner.
                  </li>
                )}
                {tasks.map((t) => (
                  <li key={t.id} className="dash-task-item">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(t)}
                      aria-label="Toggle task done"
                    >
                      {t.done ? (
                        <CheckCircle2
                          size={19}
                          strokeWidth={1.6}
                          style={{ color: "var(--color-primary)" }}
                        />
                      ) : (
                        <Circle
                          size={19}
                          strokeWidth={1.5}
                          style={{ color: "var(--color-border-strong)" }}
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      className={`dash-task-text${t.done ? " is-done" : ""}`}
                      onClick={() => setSelectedTaskId(t.id)}
                    >
                      {t.text}
                    </button>
                    {t.time && (
                      <span
                        className="text-[11.5px] font-mono shrink-0"
                        style={{ color: "var(--color-ink-muted)" }}
                      >
                        {t.time}
                      </span>
                    )}
                    {t.source === "plan" && (
                      <span className="chip" style={{ fontSize: 10, padding: "2px 6px" }}>
                        AI
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="dash-card__foot">
                <span>
                  {hasPlannerData
                    ? "Synced with planner & AI plan"
                    : "Add tasks or generate a plan"}
                </span>
                <Link href="/student-desk/planner">
                  Open planner <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            <nav className="dash-launch" aria-label="Quick links">
              {QUICK_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="dash-launch__item">
                  <span className="dash-launch__icon">
                    <link.icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="dash-launch__label">{link.label}</span>
                  <span className="dash-launch__desc">{link.desc}</span>
                </Link>
              ))}
            </nav>

            <div className="dash-actions">
              <MistakesDueCard />
              <WeaknessSummaryCard />
            </div>
          </div>

          {/* Right rail — countdown, week, pomodoro */}
          <aside className="dash-rail">
            <div className="dash-card" data-testid="countdown-card">
              <h2 className="dash-exam__title">Exam countdown</h2>
              {COUNTDOWNS.map((c) => {
                const days = daysUntil(c.date);
                return (
                  <div key={c.name} className="dash-exam__row">
                    <div className="dash-exam__name">{c.name}</div>
                    <div className="dash-exam__days">
                      <span
                        className={`dash-exam__num${c.tone === "accent" ? " dash-exam__num--hot" : ""}`}
                      >
                        {days}
                      </span>
                      <span className="dash-exam__unit">days</span>
                    </div>
                    <div className="dash-exam__date">
                      {new Date(c.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                );
              })}
              <Link
                href="/planning-tools/upsc-calendar"
                className="dash-exam__link"
              >
                Exam calendar <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="dash-card">
              <div className="dash-card__eyebrow">This week</div>
              <div className="dash-week__ring-wrap">
                <ProgressRing pct={weeklyPct} size={72} />
                <div>
                  <div className="dash-week__pct">
                    {weeklyPct}<span>%</span>
                  </div>
                  <div className="dash-week__label">of weekly goals</div>
                </div>
              </div>
              <div className="dash-week__stat">
                <span>Study hours</span>
                <strong>
                  {metrics.weeklyStudyHours.toFixed(1)} / {metrics.weeklyGoal}h
                </strong>
              </div>
              <div className="dash-week__stat">
                <span>Notes</span>
                <strong>
                  {metrics.notesThisWeek} / {metrics.weeklyNotesGoal}
                </strong>
              </div>
              <div className="dash-week__stat" data-testid="mocks-attempted">
                <span>Mocks</span>
                <strong>
                  {metrics.mocksAttempted} / {metrics.weeklyMocksGoal}
                </strong>
              </div>
            </div>

            <div className="dash-card" data-testid="pomodoro-card">
              <div className="dash-card__eyebrow">Focus</div>
              <h2 className="dash-card__title">Pomodoro</h2>

              <div className="dash-pomo-modes">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => switchMode(m.key)}
                    className={`dash-pomo-mode${mode === m.key ? " is-active" : ""}`}
                  >
                    <m.icon size={12} strokeWidth={1.6} /> {m.label}
                  </button>
                ))}
              </div>

              <div className="dash-pomo-compact">
                <div>
                  <div className="dash-pomo-time">{formatTime(secondsLeft)}</div>
                  <div className="dash-pomo-mode-label">{mode}</div>
                </div>
                <div className="dash-pomo-btns">
                  <button
                    type="button"
                    onClick={resetTimer}
                    aria-label="Reset timer"
                    className="dash-pomo-btn dash-pomo-btn--reset"
                  >
                    <RotateCcw size={14} strokeWidth={1.6} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRunning((r) => !r)}
                    aria-label={isRunning ? "Pause timer" : "Start timer"}
                    className="dash-pomo-btn dash-pomo-btn--play"
                  >
                    {isRunning ? (
                      <Pause size={18} strokeWidth={1.8} fill="currentColor" />
                    ) : (
                      <Play
                        size={18}
                        strokeWidth={1.8}
                        fill="currentColor"
                        style={{ marginLeft: 2 }}
                      />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="dash-pomo-task"
                onClick={() =>
                  setSelectedTaskId(
                    selectedTaskId ? null : (tasks[0]?.id ?? null),
                  )
                }
              >
                <span className="dash-pomo-task__dot" />
                <span>
                  {selectedTask ? selectedTask.text : "Tap to link a task"}
                </span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </StudentLayout>
  );
}

function ProgressRing({ pct, size = 72 }) {
  const r = size * 0.38;
  const c = 2 * Math.PI * r;
  const center = size / 2;
  const dash = c * (Math.max(0, Math.min(100, pct)) / 100);

  return (
    <svg width={size} height={size}>
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        strokeWidth="6"
        className="ring-track"
      />
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        strokeWidth="6"
        className="ring-progress"
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        strokeDasharray={`${dash} ${c}`}
      />
    </svg>
  );
}
