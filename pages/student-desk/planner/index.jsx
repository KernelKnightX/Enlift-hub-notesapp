import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/config";
import Sidebar from "../../../components/common/sidebar";
import TaskModal from "../../../components/planner/TaskModal";
import TaskPill from "../../../components/planner/TaskPill";
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, getDoc, getDocs,
} from "firebase/firestore";

/* ─── Constants ─────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { label: "Dashboard",       icon: "⌂", href: "/student-desk/dashboard" },
  { label: "Current Affairs", icon: "◈", href: "/student-desk/current-affairs" },
  { label: "PYQ Papers",      icon: "◎", href: "/student-desk/pyq" },
  { label: "Mock Tests",      icon: "◷", href: "/student-desk/mock-tests" },
  { label: "Study Notes",     icon: "✎", href: "/student-desk/notes" },
  { label: "Syllabus",        icon: "≡", href: "/student-desk/syllabus" },
  { label: "Planner",         icon: "⊞", href: "/student-desk/planner", active: true },
  { label: "Profile",         icon: "👤", href: "/student-desk/profile" },
];

const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const QUICK_TEMPLATES = [
  { label: "📖 Read NCERT", subject: "polity", taskType: "study", duration: 60 },
  { label: "✍️ Answer Writing", subject: "answer", taskType: "answer", duration: 45 },
  { label: "🔄 Revision", subject: "revision", taskType: "revision", duration: 30 },
  { label: "📰 Current Affairs", subject: "currentaff", taskType: "ca", duration: 30 },
  { label: "📝 Mock Test", subject: "mock", taskType: "mock", duration: 180 },
  { label: "📚 Essay", subject: "essay", taskType: "study", duration: 60 },
];

/* ─── Helpers ───────────────────────────────────────────────────── */

function getWeekDates(offset = 0) {
  const now  = new Date();
  const day  = now.getDay(); // 0=Sun
  const mon  = new Date(now);
  mon.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function getMonthDates(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates = [];
  
  // Add padding for days before first of month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    dates.push({ date: d, isCurrentMonth: false });
  }
  
  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  
  // Add padding for days after last of month
  const endPadding = 42 - dates.length; // 6 rows * 7 days
  for (let i = 1; i <= endPadding; i++) {
    dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }
  
  return dates;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function isToday(date) {
  return toDateKey(date) === toDateKey(new Date());
}

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function Planner() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  // ── All state at top ──
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [viewMode,    setViewMode]      = useState("week"); // "week" or "month"
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editTask,     setEditTask]     = useState(null);
  const [defaultDate,  setDefaultDate]  = useState("");
  const [defaultTaskType, setDefaultTaskType] = useState("study");
  const [profile,       setProfile]      = useState(null);
  const [userNotes,     setUserNotes]    = useState([]);
  const [userPyqs,      setUserPyqs]     = useState([]);
  const [allTasks,      setAllTasks]      = useState([]); // For analytics
  const [streak,        setStreak]        = useState(0);
  const [suggestions,   setSuggestions]   = useState([]);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date();
  const monthDates = getMonthDates(today.getFullYear(), today.getMonth());

  /* Auth guard */
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  /* Fetch user profile */
  useEffect(() => {
    if (!user?.uid) return;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user?.uid]);

  /* Fetch user notes for linking */
  useEffect(() => {
    if (!user?.uid) return;
    const fetchNotes = async () => {
      try {
        const notesRef = collection(db, "users", user.uid, "pdfNotes");
        const snap = await getDocs(notesRef);
        const notes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUserNotes(notes.slice(0, 20)); // Limit to 20
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
    };
    fetchNotes();
  }, [user?.uid]);

  /* Derived values */
  const displayName = profile?.fullName || profile?.name || user?.email?.split("@")[0] || "Aspirant";

  /* Live tasks from Firestore — scoped to current week/month */
  useEffect(() => {
    if (!user?.uid) return;
    
    let q;
    if (viewMode === "week") {
      const startKey = toDateKey(weekDates[0]);
      const endKey   = toDateKey(weekDates[6]);
      q = query(
        collection(db, "users", user.uid, "plannerTasks"),
        where("dateKey", ">=", startKey),
        where("dateKey", "<=", endKey),
        orderBy("dateKey"),
        orderBy("createdAt")
      );
    } else {
      // Month view - get whole month based on current date
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startKey = toDateKey(new Date(year, month, 1));
      const endKey = toDateKey(new Date(year, month + 1, 0));
      q = query(
        collection(db, "users", user.uid, "plannerTasks"),
        where("dateKey", ">=", startKey),
        where("dateKey", "<=", endKey),
        orderBy("dateKey")
      );
    }

    setLoading(true);
    const unsub = onSnapshot(q,
      snap => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      err => { console.error("Planner error:", err); setLoading(false); }
    );

    return () => unsub();
  }, [user?.uid, weekOffset, viewMode]);

  /* Fetch ALL tasks for analytics - streak & suggestions */
  useEffect(() => {
    if (!user?.uid) return;
    
    const fetchAllTasks = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "plannerTasks"),
          orderBy("dateKey", "desc")
        );
        const snap = await getDocs(q);
        const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllTasks(tasks);
        
        // Calculate streak
        calculateStreak(tasks);
        
        // Generate smart suggestions
        generateSuggestions(tasks);
      } catch (err) {
        console.error("Error fetching all tasks:", err);
      }
    };
    fetchAllTasks();
    
    // Also set up real-time listener for analytics
    const q = query(
      collection(db, "users", user.uid, "plannerTasks"),
      orderBy("dateKey", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const tasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllTasks(tasks);
      calculateStreak(tasks);
      generateSuggestions(tasks);
    });
    
    return () => unsub();
  }, [user?.uid]);

  /* Calculate daily streak */
  const calculateStreak = (tasks) => {
    if (!tasks || tasks.length === 0) {
      setStreak(0);
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique dates with completed tasks
    const completedDates = new Set(
      tasks
        .filter(t => t.done)
        .map(t => t.dateKey)
    );
    
    let streakCount = 0;
    let checkDate = new Date(today);
    
    // Check consecutive days backwards
    while (true) {
      const dateKey = toDateKey(checkDate);
      if (completedDates.has(dateKey)) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Allow missing today if it's still early
        if (streakCount === 0 && toDateKey(today) === dateKey) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    
    setStreak(streakCount);
  };

  /* Generate smart suggestions based on task history */
  const generateSuggestions = (tasks) => {
    if (!tasks || tasks.length === 0) {
      setSuggestions([]);
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const SUBJECT_LABELS = {
      polity: "Polity", economy: "Economy", geography: "Geography",
      history: "History", science: "Science & Tech", environment: "Environment",
      ethics: "Ethics", essay: "Essay", revision: "Revision",
      mock: "Mock Test", currentaff: "Current Affairs", answer: "Answer Writing"
    };
    
    const newSuggestions = [];
    
    // Check last activity for each subject
    const subjectLastActivity = {};
    tasks.forEach(task => {
      if (!subjectLastActivity[task.subject] || task.dateKey > subjectLastActivity[task.subject]) {
        subjectLastActivity[task.subject] = task.dateKey;
      }
    });
    
    // Check for subjects not studied in 5+ days
    Object.keys(subjectLastActivity).forEach(subject => {
      const lastDate = new Date(subjectLastActivity[subject]);
      const daysAgo = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysAgo >= 5 && subject !== 'revision' && subject !== 'mock') {
        newSuggestions.push({
          type: 'warning',
          message: `You haven't studied ${SUBJECT_LABELS[subject] || subject} in ${daysAgo} days`,
          subject: subject
        });
      }
    });
    
    // Check if no tasks today
    const todayKey = toDateKey(today);
    const todayTasks = tasks.filter(t => t.dateKey === todayKey);
    if (todayTasks.length === 0) {
      newSuggestions.push({
        type: 'action',
        message: "Start your day! Add your first task for today",
        action: 'add_today'
      });
    }
    
    // Check for pending high priority tasks
    const pendingHigh = tasks.filter(t => !t.done && t.priority === 'high');
    if (pendingHigh.length > 0) {
      newSuggestions.push({
        type: 'urgent',
        message: `You have ${pendingHigh.length} high priority task(s) pending`,
        action: 'show_pending'
      });
    }
    
    setSuggestions(newSuggestions.slice(0, 3)); // Max 3 suggestions
  };

  /* Handle logout */
  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); router.push("/login"); }
    catch { toast.error("Error logging out."); }
  };

  /* Open modal to add a task for a specific day */
  const openAdd = useCallback((dateKey, taskType = "study") => {
    setEditTask(null);
    setDefaultDate(dateKey);
    setDefaultTaskType(taskType);
    setModalOpen(true);
  }, []);

  /* Open modal to add with template */
  const openWithTemplate = useCallback((template) => {
    const todayKey = toDateKey(new Date());
    setEditTask(null);
    setDefaultDate(todayKey);
    setModalOpen(true);
    // Pre-fill form via timeout (modal will open with defaults)
    setTimeout(() => {
      // This will be handled by TaskModal's defaultDateKey
    }, 100);
  }, []);

  /* Open modal to edit an existing task */
  const openEdit = useCallback((task) => {
    setEditTask(task);
    setDefaultDate(task.dateKey);
    setModalOpen(true);
  }, []);

  /* Save (create or update) */
  const handleSave = async (form) => {
    try {
      if (editTask) {
        await updateDoc(doc(db, "users", user.uid, "plannerTasks", editTask.id), {
          title:     form.title,
          subject:   form.subject,
          priority:  form.priority,
          duration:  form.duration,
          notes:     form.notes,
          dateKey:   form.dateKey,
          taskType:  form.taskType,
          resourceLink: form.resourceLink || "",
          resourceType: form.resourceType || "",
          recurring: form.recurring || false,
          recurringDays: form.recurringDays || [],
        });
        toast.success("Task updated!");
      } else {
        // Handle recurring tasks
        if (form.recurring && form.recurringDays?.length > 0) {
          // Create tasks for each selected day
          const promises = form.recurringDays.map(dayIndex => {
            const taskDate = new Date();
            const diff = dayIndex - taskDate.getDay();
            taskDate.setDate(taskDate.getDate() + (diff >= 0 ? diff : diff + 7));
            return addDoc(collection(db, "users", user.uid, "plannerTasks"), {
              title:       form.title,
              subject:     form.subject,
              priority:    form.priority,
              duration:    form.duration,
              notes:       form.notes,
              dateKey:     toDateKey(taskDate),
              taskType:    form.taskType,
              resourceLink: form.resourceLink || "",
              resourceType: form.resourceType || "",
              done:        false,
              recurring:   true,
              recurringDays: form.recurringDays,
              createdAt:   serverTimestamp(),
            });
          });
          await Promise.all(promises);
          toast.success("Recurring tasks created!");
        } else {
          await addDoc(collection(db, "users", user.uid, "plannerTasks"), {
            title:       form.title,
            subject:     form.subject,
            priority:    form.priority,
            duration:    form.duration,
            notes:       form.notes,
            dateKey:     form.dateKey,
            taskType:    form.taskType,
            resourceLink: form.resourceLink || "",
            resourceType: form.resourceType || "",
            done:        false,
            createdAt:   serverTimestamp(),
          });
          toast.success("Task added!");
        }
      }
      setModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save task.");
    }
  };

  /* Delete */
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "plannerTasks", id));
      toast.success("Task deleted.");
      setModalOpen(false);
    } catch { toast.error("Failed to delete task."); }
  };

  /* Toggle done */
  const handleToggle = async (task) => {
    try {
      await updateDoc(doc(db, "users", user.uid, "plannerTasks", task.id), { done: !task.done });
    } catch { toast.error("Failed to update task."); }
  };

  if (authLoading) return null;
  if (!user)       return null;

  /* ── Derived stats ── */
  const total     = tasks.length;
  const done      = tasks.filter(t => t.done).length;
  const pending   = total - done;
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;
  const totalMins = tasks.filter(t => !t.done).reduce((s, t) => s + (t.duration || 0), 0);
  const totalHrs  = (totalMins / 60).toFixed(1);

  // Subject-wise time distribution (from all tasks)
  const SUBJECT_COLORS = {
    polity: "#3b82f6", economy: "#10b981", geography: "#f59e0b",
    history: "#8b5cf6", science: "#ef4444", environment: "#22c55e",
    ethics: "#f97316", essay: "#0ea5e9", revision: "#c9a84c",
    mock: "#6b7280", currentaff: "#dc2626", answer: "#b45309"
  };
  const SUBJECT_LABELS = {
    polity: "Polity", economy: "Economy", geography: "Geography",
    history: "History", science: "Science & Tech", environment: "Environment",
    ethics: "Ethics", essay: "Essay", revision: "Revision",
    mock: "Mock Test", currentaff: "Current Affairs", answer: "Answer Writing"
  };
  
  const subjectTime = {};
  allTasks.forEach(task => {
    if (task.duration) {
      subjectTime[task.subject] = (subjectTime[task.subject] || 0) + task.duration;
    }
  });
  const subjectDistribution = Object.entries(subjectTime)
    .map(([subject, minutes]) => ({ subject, minutes, hours: (minutes / 60).toFixed(1) }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 4); // Top 4 subjects
  const totalSubjectMins = Object.values(subjectTime).reduce((s, m) => s + m, 0);

  // Monthly stats
  const monthTotal = tasks.length;
  const monthDone = tasks.filter(t => t.done).length;
  const monthPct = monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0;

  const weekLabel = (() => {
    const s = weekDates[0], e = weekDates[6];
    const fmt = d => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    return `${fmt(s)} – ${fmt(e)}, ${s.getFullYear()}`;
  })();

  const monthLabel = today.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const dateStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  /* ── Render helpers ── */
  const getTasksForDate = (dateKey) => {
    return tasks.filter(t => t.dateKey === dateKey);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        :root {
          --ink: #0f1923;
          --ink-2: #2c3e50;
          --ink-3: #64748b;
          --paper: #f5f2ee;
          --paper-2: #ede9e3;
          --paper-3: #e2ddd6;
          --gold: #c9a84c;
          --gold-light: #f0d98a;
          --emerald: #1a6b4a;
          --radius: 16px;
          --shadow: 0 4px 24px rgba(15,25,35,.08);
          --shadow-lg: 0 12px 40px rgba(15,25,35,.14);
        }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,25,35,.55);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .modal {
          background: white;
          border-radius: var(--radius);
          width: 100%;
          max-width: 520px;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.2s ease;
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .modal-head {
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--paper-2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: var(--ink);
        }
        
        .modal-close {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid var(--paper-3);
          background: transparent;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-close:hover {
          background: var(--ink);
          color: white;
          border-color: var(--ink);
        }
        
        .modal-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        
        .field-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ink-2);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .field-input, .field-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--paper-3);
          border-radius: 10px;
          font-size: 0.88rem;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          outline: none;
          background: white;
          transition: border-color 0.15s;
        }
        
        .field-input:focus, .field-select:focus {
          border-color: var(--gold);
        }
        
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .modal-foot {
          padding: 16px 24px 20px;
          border-top: 1px solid var(--paper-2);
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .btn-cancel {
          padding: 9px 20px;
          border-radius: 10px;
          border: 1px solid var(--paper-3);
          background: transparent;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink-3);
        }
        
        .btn-save {
          padding: 9px 24px;
          border-radius: 10px;
          border: none;
          background: var(--ink);
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        
        .btn-save:hover {
          background: var(--gold);
        }
        
        .btn-danger {
          padding: 9px 20px;
          border-radius: 10px;
          border: 1px solid #fee2e2;
          background: #fff5f5;
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          margin-right: auto;
        }
        
        .task-type-badge {
          font-size: 0.55rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 3px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        
        .task-type-study { background: #e0f2fe; color: #0369a1; }
        .task-type-answer { background: #fef3c7; color: #b45309; }
        .task-type-revision { background: #dcfce7; color: #15803d; }
        .task-type-mock { background: #f3e8ff; color: #7c3aed; }
        .task-type-ca { background: #ffedd5; color: #c2410c; }
        
        .recurring-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--paper-2);
          border-radius: 10px;
        }
        
        .recurring-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .recurring-toggle label {
          font-size: 0.85rem;
          color: var(--ink-2);
          cursor: pointer;
        }
        
        .recurring-days {
          display: flex;
          gap: 4px;
          margin-left: 8px;
        }
        
        .recurring-day {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--paper-3);
          background: white;
          font-size: 0.65rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        
        .recurring-day.selected {
          background: var(--gold);
          border-color: var(--gold);
          color: white;
        }
        
        .resource-link-field {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .resource-link-select {
          flex: 1;
        }
        
        .resource-link-btn {
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--paper-3);
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          color: var(--ink-3);
          transition: all 0.15s;
        }
        
        .resource-link-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
        }
      `}} />
      <link rel="stylesheet" href="/styles/planner.css" />
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

        <main className="main">
          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <div>
                <div className="topbar-title">Weekly Planner</div>
                <div className="topbar-date">{dateStr}</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="avatar">{displayName[0]?.toUpperCase() || "U"}</div>
            </div>
          </header>

          <div className="content">

            {/* Page header */}
            <div className="page-header animate">
              <div className="page-header-pattern" />
              <div className="page-header-accent" />
              <div className="page-header-left">
                <h1 className="page-title">⊞ Weekly Study Planner</h1>
                <p className="page-subtitle">Organise your week. Track your progress. Stay ahead.</p>
              </div>
              <div className="header-actions">
                {/* Quick Templates */}
                <div className="quick-templates">
                  {QUICK_TEMPLATES.map((t, i) => (
                    <button 
                      key={i} 
                      className="template-btn"
                      onClick={() => openAdd(toDateKey(new Date()), t.taskType)}
                      title={`Add ${t.label} task`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <button className="add-task-btn" onClick={() => openAdd(toDateKey(new Date()))}>
                  + Add Task
                </button>
              </div>
            </div>

            {/* Stats strip */}
            <div className="stats-strip animate delay-1">
              {[
                { label: viewMode === "week" ? "This Week" : "This Month",    val: viewMode === "week" ? total : monthTotal,    fill: "#3b82f6",  pct: 100      },
                { label: "Completed",      val: viewMode === "week" ? done : monthDone,     fill: "#10b981",  pct: viewMode === "week" ? pct : monthPct },
                { label: "Pending",        val: viewMode === "week" ? pending : (monthTotal - monthDone),  fill: "#f59e0b",  pct: viewMode === "week" ? (total > 0 ? Math.round((pending/total)*100) : 0) : (monthTotal > 0 ? Math.round(((monthTotal-monthDone)/monthTotal)*100) : 0) },
                { label: "Hours Remaining",val: `${viewMode === "week" ? totalHrs : (tasks.filter(t => !t.done).reduce((s, t) => s + (t.duration || 0), 0) / 60).toFixed(1)}h`, fill: "#c9a84c", pct: 100 },
              ].map(s => (
                <div className="strip-card" key={s.label}>
                  <div className="strip-val">{loading ? <span className="skeleton" style={{ width: 40, height: 28, display: "inline-block" }} /> : s.val}</div>
                  <div className="strip-label">{s.label}</div>
                  <div className="strip-bar">
                    <div className="strip-fill" style={{ width: `${s.pct}%`, background: s.fill }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Analytics Row: Streak + Subject Distribution */}
            <div className="analytics-row animate delay-2">
              {/* Streak Card */}
              <div className="analytics-card">
                <div className="analytics-title">🔥 Daily Streak</div>
                <div className="streak-display">
                  <div className="streak-icon">🔥</div>
                  <div className="streak-info">
                    <div className="streak-count">{streak} <span className="streak-fire">days</span></div>
                    <div className="streak-label">{streak > 0 ? "Keep it up!" : "Start today!"}</div>
                  </div>
                </div>
              </div>

              {/* Subject Distribution Card */}
              <div className="analytics-card">
                <div className="analytics-title">📊 Subject-wise Time Distribution</div>
                {subjectDistribution.length === 0 ? (
                  <div style={{ fontSize: ".82rem", color: "var(--ink-3)", padding: "8px 0" }}>
                    Add tasks to see your time distribution.
                  </div>
                ) : (
                  <div className="subject-dist">
                    {subjectDistribution.map((item) => (
                      <div key={item.subject} className="subject-row">
                        <div className="subject-dot" style={{ background: SUBJECT_COLORS[item.subject] || '#6b7280' }} />
                        <div className="subject-name">{SUBJECT_LABELS[item.subject] || item.subject}</div>
                        <div className="subject-bar-container">
                          <div 
                            className="subject-bar" 
                            style={{ 
                              width: `${totalSubjectMins > 0 ? (item.minutes / totalSubjectMins) * 100 : 0}%`,
                              background: SUBJECT_COLORS[item.subject] || '#6b7280'
                            }} 
                          />
                        </div>
                        <div className="subject-time">{item.hours}h</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Week/Month navigator */}
            <div className="week-nav animate delay-2">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button className="week-btn" onClick={() => {
                  if (viewMode === "week") setWeekOffset(w => w - 1);
                  else setWeekOffset(w => w - 4);
                }}>‹</button>
                <span className="week-label">{viewMode === "week" ? weekLabel : monthLabel}</span>
                <button className="week-btn" onClick={() => {
                  if (viewMode === "week") setWeekOffset(w => w + 1);
                  else setWeekOffset(w => w + 4);
                }}>›</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* View Toggle */}
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewMode === "week" ? "active" : ""}`}
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </button>
                  <button 
                    className={`view-btn ${viewMode === "month" ? "active" : ""}`}
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </button>
                </div>
                <div style={{ fontSize: ".78rem", color: "var(--ink-3)" }}>
                  {viewMode === "week" ? `${pct}%` : `${monthPct}%`} complete
                </div>
                <div style={{ width: 80, height: 5, borderRadius: 99, background: "var(--paper-3)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${viewMode === "week" ? pct : monthPct}%`, background: "#10b981", borderRadius: 99, transition: "width .6s" }} />
                </div>
                {weekOffset !== 0 && (
                  <button className="today-btn" onClick={() => { setWeekOffset(0); setViewMode("week"); }}>This Week</button>
                )}
              </div>
            </div>

            {/* Month View */}
            {viewMode === "month" && (
              <div className="monthly-stats animate delay-2">
                <div className="monthly-header">
                  <span className="monthly-title">{monthLabel}</span>
                </div>
                <div className="monthly-grid">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} style={{ textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: 'var(--ink-3)', padding: '4px 0' }}>
                      {d}
                    </div>
                  ))}
                  {monthDates.map((item, i) => {
                    const key = toDateKey(item.date);
                    const dayTasks = getTasksForDate(key);
                    const hasDone = dayTasks.some(t => t.done);
                    const hasPending = dayTasks.some(t => !t.done);
                    const isTodayDate = isToday(item.date);
                    
                    return (
                      <div 
                        key={i}
                        className={`month-day ${item.isCurrentMonth ? 'has-tasks' : ''} ${isTodayDate ? 'today' : ''}`}
                        style={{ 
                          opacity: item.isCurrentMonth ? 1 : 0.3,
                          background: isTodayDate ? 'var(--gold-light)' : (dayTasks.length > 0 ? 'var(--paper-2)' : 'white')
                        }}
                        onClick={() => openAdd(key)}
                        title={dayTasks.length > 0 ? `${dayTasks.length} tasks` : 'Add task'}
                      >
                        {item.date.getDate()}
                        {dayTasks.length > 0 && (
                          <div className={`task-dot ${hasPending ? 'pending' : ''}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Week grid */}
            <div className="week-grid animate delay-3">
              {weekDates.map((date) => {
                const key        = toDateKey(date);
                const dayTasks   = getTasksForDate(key);
                const todayClass = isToday(date) ? "today" : "";
                return (
                  <div key={key} className={`day-col ${todayClass}`} style={{ position: 'relative', borderColor: isToday(date) ? '#c9a84c' : undefined }}>
                    <div className="day-head" style={{ background: isToday(date) ? '#f0d98a' : undefined }}>
                      {isToday(date) && (
                        <div style={{
                          position: 'absolute',
                          top: -10,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#c9a84c',
                          color: 'white',
                          fontSize: '0.5rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 3,
                          zIndex: 10
                        }}>
                          TODAY
                        </div>
                      )}
                      <div>
                        <div className="day-name" style={{ color: isToday(date) ? '#0f1923' : undefined }}>{DAYS[weekDates.indexOf(date)]}</div>
                        <div className="day-num" style={{ color: isToday(date) ? '#c9a84c' : undefined, fontWeight: 700 }}>
                          {date.getDate()}
                        </div>
                      </div>
                      <button className="day-add" onClick={() => openAdd(key)} title="Add task">+</button>
                    </div>
                    <div className="day-tasks">
                      {loading ? (
                        [1, 2].map(i => (
                          <span key={i} className="skeleton" style={{ height: 52, borderRadius: 8, display: "block" }} />
                        ))
                      ) : dayTasks.length === 0 ? (
                        <div className="day-empty">No tasks</div>
                      ) : (
                        dayTasks.map(task => (
                          <TaskPill key={task.id} task={task} onEdit={openEdit} onToggle={handleToggle} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </main>
      </div>

      {/* Add / Edit modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        editTask={editTask}
        defaultDateKey={defaultDate}
        defaultTaskType={defaultTaskType}
        userNotes={userNotes}
        userPyqs={userPyqs}
      />
    </>
  );
}
