import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/config";
import Sidebar from "../../../components/common/sidebar";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

/* ─── Static constants ──────────────────────────────────────────── */

const motivationalQuotes = [
  { text: "The brave may not live forever, but the cautious do not live at all.", author: "Harsh Joshi" },
  { text: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The only easy day was yesterday.", author: "Navy SEALs" },
  { text: "Victory belongs to the most persevering.", author: "Napoleon Bonaparte" },
  { text: "I will prepare and someday my chance will come.", author: "Abraham Lincoln" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
];

const EXAM_DATES = {
  prelims: new Date("2026-06-20"),
  mains:   new Date("2026-09-20"),
};

/* ─── Helpers ───────────────────────────────────────────────────── */

function daysUntil(date) {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

function formatRelative(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const min  = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (min  < 1)  return "Just now";
  if (min  < 60) return `${min}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days <  7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Styles ────────────────────────────────────────────────────── */

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:        #0f1923;
    --ink-2:      #2c3e50;
    --ink-3:      #64748b;
    --paper:      #f5f2ee;
    --paper-2:    #ede9e3;
    --paper-3:    #e2ddd6;
    --gold:       #c9a84c;
    --gold-light: #f0d98a;
    --emerald:    #1a6b4a;
    --sapphire:   #1a3f6b;
    --crimson:    #8b1a1a;
    --sidebar-w:  260px;
    --radius:     16px;
    --shadow:     0 4px 24px rgba(15,25,35,.08);
    --shadow-lg:  0 12px 40px rgba(15,25,35,.14);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--paper); color: var(--ink); }
  .layout { display: flex; min-height: 100vh; }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-w); background: var(--ink);
    position: fixed; top: 0; left: 0; bottom: 0;
    display: flex; flex-direction: column; z-index: 100;
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .sidebar-logo     { padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,.08); }
  .sidebar-logo-text{ font-family:'Playfair Display',serif; font-size:1.35rem; color:#fff; line-height:1.2; }
  .sidebar-logo-sub { font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:var(--gold); margin-top:3px; }
  .sidebar-nav      { flex:1; padding:16px 12px; overflow-y:auto; }
  .nav-item {
    display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px;
    color:rgba(255,255,255,.55); font-size:.88rem; font-weight:500;
    cursor:pointer; transition:all .18s; text-decoration:none; margin-bottom:2px;
  }
  .nav-item:hover  { background:rgba(255,255,255,.07); color:rgba(255,255,255,.9); }
  .nav-item.active { background:var(--gold); color:var(--ink); }
  .nav-icon        { font-size:1.1rem; width:22px; text-align:center; }
  .sidebar-footer  { padding:16px 12px 20px; border-top:1px solid rgba(255,255,255,.08); }
  .logout-btn {
    width:100%; display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px;
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    color:rgba(255,255,255,.6); font-size:.85rem; font-weight:500;
    cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif;
  }
  .logout-btn:hover { background:rgba(220,50,50,.2); color:#fca5a5; border-color:rgba(220,50,50,.3); }
  .sidebar-overlay  { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:99; }

  /* ── Main ── */
  .main    { margin-left:var(--sidebar-w); flex:1; min-width:0; }
  .topbar  {
    position:sticky; top:0; z-index:50;
    background:rgba(245,242,238,.92); backdrop-filter:blur(12px);
    border-bottom:1px solid var(--paper-3); padding:0 32px; height:64px;
    display:flex; align-items:center; justify-content:space-between;
  }
  .topbar-left     { display:flex; align-items:center; gap:14px; }
  .hamburger {
    display:none; width:36px; height:36px; border-radius:8px;
    border:1px solid var(--paper-3); background:white;
    align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem;
  }
  .topbar-greeting { font-family:'Playfair Display',serif; font-size:1.05rem; color:var(--ink); }
  .topbar-date     { font-size:.78rem; color:var(--ink-3); margin-top:1px; }
  .topbar-right    { display:flex; align-items:center; gap:10px; }
  .avatar {
    width:36px; height:36px; border-radius:50%; background:var(--ink); color:var(--gold);
    display:flex; align-items:center; justify-content:center;
    font-weight:700; font-size:.9rem; font-family:'Playfair Display',serif;
  }

  /* ── Content ── */
  .content { padding:28px 32px; max-width:1200px; }
  .section-label {
    font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
    color:var(--ink-3); margin-bottom:14px; display:flex; align-items:center; gap:8px;
  }
  .section-label::after { content:''; flex:1; height:1px; background:var(--paper-3); }

  /* ── Hero ── */
  .hero {
    border-radius:var(--radius); background:var(--ink);
    padding:28px 32px; position:relative; overflow:hidden; margin-bottom:28px;
  }
  .hero-pattern {
    position:absolute; inset:0; opacity:.04;
    background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);
    background-size:20px 20px;
  }
  .hero-accent {
    position:absolute; right:-40px; top:-40px; width:220px; height:220px; border-radius:50%;
    background:radial-gradient(circle,var(--gold) 0%,transparent 70%); opacity:.12;
  }
  .hero-content      { position:relative; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
  .hero-quote        { font-family:'Playfair Display',serif; font-style:italic; font-size:1.15rem; color:rgba(255,255,255,.9); max-width:480px; line-height:1.6; }
  .hero-quote-author { font-size:.78rem; font-weight:500; letter-spacing:.08em; color:var(--gold); margin-top:10px; text-transform:uppercase; }
  .hero-badge        { background:rgba(201,168,76,.15); border:1px solid rgba(201,168,76,.3); border-radius:10px; padding:14px 20px; text-align:center; flex-shrink:0; }
  .hero-badge-num    { font-family:'Playfair Display',serif; font-size:2.2rem; color:var(--gold-light); line-height:1; }
  .hero-badge-label  { font-size:.72rem; color:rgba(255,255,255,.5); margin-top:4px; text-transform:uppercase; letter-spacing:.08em; }

  /* ── Stats ── */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
  .stat-card  {
    background:white; border-radius:var(--radius); padding:20px;
    box-shadow:var(--shadow); border:1px solid var(--paper-3); transition:transform .2s,box-shadow .2s;
  }
  .stat-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-lg); }
  .stat-icon  { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.25rem; margin-bottom:14px; }
  .stat-value { font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; color:var(--ink); line-height:1; }
  .stat-label { font-size:.78rem; color:var(--ink-3); margin-top:5px; font-weight:500; }

  /* ── Skeleton ── */
  @keyframes shimmer { from{background-position:-400px 0} to{background-position:400px 0} }
  .skeleton {
    border-radius:6px; display:block;
    background:linear-gradient(90deg,var(--paper-2) 25%,var(--paper-3) 50%,var(--paper-2) 75%);
    background-size:400px 100%; animation:shimmer 1.4s infinite;
  }

  /* ── Two-col / card ── */
  .two-col    { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px; }
  .card       { background:white; border-radius:var(--radius); box-shadow:var(--shadow); border:1px solid var(--paper-3); }
  .card-head  { padding:18px 22px 14px; border-bottom:1px solid var(--paper-2); display:flex; align-items:center; justify-content:space-between; }
  .card-title { font-family:'Playfair Display',serif; font-size:1rem; color:var(--ink); }
  .card-body  { padding:18px 22px; }

  /* ── Countdown ── */
  .countdown-item        { margin-bottom:18px; }
  .countdown-item:last-child { margin-bottom:0; }
  .countdown-top         { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
  .countdown-name        { font-size:.88rem; font-weight:600; color:var(--ink-2); }
  .countdown-days        { font-family:'Playfair Display',serif; font-size:1.3rem; color:var(--ink); }
  .countdown-days span   { font-size:.72rem; font-weight:500; color:var(--ink-3); font-family:'DM Sans',sans-serif; }
  .progress-track        { height:5px; border-radius:99px; background:var(--paper-3); overflow:hidden; }
  .progress-fill         { height:100%; border-radius:99px; transition:width .6s cubic-bezier(.4,0,.2,1); }
  .countdown-meta        { font-size:.72rem; color:var(--ink-3); margin-top:5px; }

  /* ── Notifications ── */
  .notif-list            { max-height:320px; overflow-y:auto; }
  .notif-empty           { padding:40px 22px; text-align:center; color:var(--ink-3); font-size:.85rem; }
  .notif-empty-icon      { font-size:2rem; margin-bottom:8px; }
  .notif-item            { display:flex; gap:12px; padding:12px 22px; border-bottom:1px solid var(--paper-2); transition:background .15s; }
  .notif-item:hover      { background:var(--paper); }
  .notif-item:last-child { border-bottom:none; }
  .notif-icon            { font-size:1.2rem; flex-shrink:0; margin-top:1px; }
  .notif-dot             { width:8px; height:8px; border-radius:50%; margin-top:6px; flex-shrink:0; margin-left:auto; }
  .notif-title           { font-size:.85rem; font-weight:600; color:var(--ink); }
  .notif-msg             { font-size:.78rem; color:var(--ink-3); margin-top:2px; line-height:1.4; }
  .notif-time            { font-size:.72rem; color:var(--ink-3); margin-top:4px; }
  .badge-count           { background:var(--crimson); color:white; font-size:.7rem; font-weight:700; border-radius:99px; padding:2px 7px; }

  /* ── Quick access ── */
  .quick-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .quick-card  {
    border-radius:12px; padding:16px; cursor:pointer; transition:all .18s;
    text-decoration:none; display:block; background:white;
  }
  .quick-card:hover { transform:translateY(-3px); box-shadow:var(--shadow-lg); }
  .quick-icon  { font-size:1.2rem; margin-bottom:8px; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .quick-label { font-size:.82rem; font-weight:600; color:var(--ink); }
  .quick-sub   { font-size:.72rem; color:var(--ink-3); margin-top:2px; }

  /* ── Enhanced Dashboard Cards ── */
  .performance-card { padding:18px 22px; }
  .performance-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .performance-title { font-size:.88rem; font-weight:600; color:var(--ink-2); }
  .performance-badge { font-size:.72rem; padding:4px 10px; border-radius:12px; font-weight:600; }
  .subject-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--paper-2); }
  .subject-row:last-child { border-bottom:none; }
  .subject-info { display:flex; align-items:center; gap:10px; }
  .subject-dot { width:10px; height:10px; border-radius:50%; }
  .subject-label { font-size:.85rem; font-weight:500; color:var(--ink); }
  .subject-score { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; }
  .no-data { text-align:center; padding:20px; color:var(--ink-3); font-size:.85rem; }

  /* Today's Tasks */
  .tasks-summary { display:flex; align-items:center; justify-content:space-between; }
  .tasks-count { font-family:'Playfair Display',serif; font-size:2.2rem; color:var(--ink); line-height:1; }
  .tasks-label { font-size:.72rem; color:var(--ink-3); margin-top:4px; }
  .tasks-progress { flex:1; margin:0 20px; }
  .tasks-progress-bar { height:8px; background:var(--paper-3); border-radius:99px; overflow:hidden; }
  .tasks-progress-fill { height:100%; background:var(--emerald); border-radius:99px; transition:width .4s; }
  .tasks-stats { display:flex; gap:16px; margin-top:12px; }
  .tasks-stat { display:flex; align-items:center; gap:6px; font-size:.78rem; }
  .tasks-stat.completed { color:var(--emerald); }
  .tasks-stat.pending { color:#f59e0b; }

  /* CA Highlights */
  .ca-highlights-list { display:flex; flex-direction:column; gap:10px; }
  .ca-highlight-item { display:flex; align-items:flex-start; gap:12px; padding:12px; border-radius:10px; background:var(--paper); cursor:pointer; transition:all .15s; }
  .ca-highlight-item:hover { background:var(--paper-2); }
  .ca-highlight-icon { font-size:1.1rem; flex-shrink:0; }
  .ca-highlight-content { flex:1; min-width:0; }
  .ca-highlight-title { font-size:.82rem; font-weight:600; color:var(--ink); line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .ca-highlight-meta { font-size:.7rem; color:var(--ink-3); margin-top:4px; }

  /* Streak & Hours */
  .streak-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; }
  .streak-item { display:flex; align-items:center; gap:10px; }
  .streak-icon { font-size:1.3rem; }
  .streak-info { }
  .streak-count { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:var(--ink); }
  .streak-label { font-size:.7rem; color:var(--ink-3); }

  /* Recent Activity */
  .activity-list { display:flex; flex-direction:column; }
  .activity-item { display:flex; align-items:flex-start; gap:12px; padding:12px 0; border-bottom:1px solid var(--paper-2); }
  .activity-item:last-child { border-bottom:none; }
  .activity-icon { font-size:1rem; flex-shrink:0; }
  .activity-content { flex:1; min-width:0; }
  .activity-title { font-size:.82rem; font-weight:600; color:var(--ink); }
  .activity-message { font-size:.75rem; color:var(--ink-3); margin-top:2px; }
  .activity-time { font-size:.7rem; color:var(--ink-3); margin-top:4px; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar      { width:4px; }
  ::-webkit-scrollbar-thumb{ background:var(--paper-3); border-radius:99px; }

  /* ── Animations ── */
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  .animate  { animation:fadeUp .5s ease both; }
  .delay-1  { animation-delay:.08s; }
  .delay-2  { animation-delay:.16s; }
  .delay-3  { animation-delay:.24s; }

  /* ── Responsive ── */
  @media (max-width:1024px){ .stats-grid{grid-template-columns:repeat(2,1fr);} }
  @media (max-width:768px){
    .sidebar{transform:translateX(-100%);}
    .sidebar.open{transform:translateX(0);}
    .sidebar-overlay.open{display:block;}
    .main{margin-left:0;}
    .hamburger{display:flex;}
    .content{padding:20px 18px;}
    .topbar{padding:0 18px;}
    .two-col{grid-template-columns:1fr;}
    .stats-grid{grid-template-columns:repeat(2,1fr);}
    .quick-grid{grid-template-columns:repeat(2,1fr);}
    .hero{padding:22px 20px;}
    .hero-badge{display:none;}
    .hero-quote{font-size:1rem;}
    .streak-row{flex-direction:column;gap:16px;align-items:flex-start;}
  }
  @media (max-width:480px){
    .stats-grid{grid-template-columns:repeat(2,1fr);}
    .quick-grid{grid-template-columns:repeat(2,1fr);}
  }
`;

/* ─── CountdownSection ───────────────────────────────────────────── */

function CountdownSection() {
  const prelDays  = daysUntil(EXAM_DATES.prelims);
  const mainsDays = daysUntil(EXAM_DATES.mains);
  const prelPct   = Math.round(((365 - prelDays)  / 365) * 100);
  const mainsPct  = Math.round(((365 - mainsDays) / 365) * 100);

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Exam Countdown</span>
        <span style={{ fontSize: ".72rem", color: "var(--ink-3)", fontWeight: 500 }}>UPSC 2026</span>
      </div>
      <div className="card-body">
        {[
          { label: "📋 Prelims", date: "Jun 20, 2026", days: prelDays,  pct: prelPct,  color: "var(--emerald)"  },
          { label: "📝 Mains",   date: "Sep 20, 2026", days: mainsDays, pct: mainsPct, color: "var(--sapphire)" },
        ].map((e) => (
          <div className="countdown-item" key={e.label}>
            <div className="countdown-top">
              <div>
                <div className="countdown-name">{e.label}</div>
                <div className="countdown-meta">{e.date}</div>
              </div>
              <div className="countdown-days">{e.days}<span> days</span></div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${e.pct}%`, background: e.color }} />
            </div>
            <div className="countdown-meta" style={{ marginTop: 6 }}>{e.pct}% of prep year elapsed</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── NotificationsCard ──────────────────────────────────────────── */

function NotificationsCard({ notifications, loading }) {
  const dotColor = (t) => {
    if (t === "success") return "#10b981";
    if (t === "warning") return "#f59e0b";
    if (t === "error")   return "#ef4444";
    return "#3b82f6";
  };

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Notifications</span>
        {notifications.length > 0 && (
          <span className="badge-count">{notifications.length}</span>
        )}
      </div>
      <div className="notif-list">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div className="notif-item" key={i} style={{ gap: 10 }}>
              <span className="skeleton" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span className="skeleton" style={{ height: 12, width: "60%", marginBottom: 6, display: "block" }} />
                <span className="skeleton" style={{ height: 10, width: "85%", display: "block" }} />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">🔕</div>
            <div>No notifications — you're all caught up!</div>
          </div>
        ) : (
          notifications.map((n) => (
            <div className="notif-item" key={n.id}>
              <span className="notif-icon">{n.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{formatRelative(n.timestamp)}</div>
              </div>
              <div className="notif-dot" style={{ background: dotColor(n.type) }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────── */

export default function StudentDashboard() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [pageLoading,   setPageLoading]   = useState(true);
  const [notifsLoading, setNotifsLoading] = useState(true);
  const [profile,       setProfile]       = useState(null);
  const [quote,         setQuote]         = useState(motivationalQuotes[0]);
  const [time,          setTime]          = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [cardData,      setCardData]      = useState({
    studyNotes: null, mockTests: null, mockTestAvg: null, mockTestBest: null, 
    mockTestWeekly: null, mockTestQuestions: null, mockTestStrongest: null, mockTestWeakest: null,
    pyq: null, currentAffairs: null,
  });
  
  // New state for enhanced dashboard
  const [todayTasks, setTodayTasks] = useState({ total: 0, completed: 0, pending: 0 });
  const [caStreak, setCaStreak] = useState(0);
  const [caHighlights, setCaHighlights] = useState([]);
  const [weeklyStudyHours, setWeeklyStudyHours] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  /* Auth guard */
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [user, authLoading, router]);

  /* Clock */
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  /* Quote rotation */
  useEffect(() => {
    const rotate = () =>
      setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    rotate();
    const id = setInterval(rotate, 120000);
    return () => clearInterval(id);
  }, []);

  /* Load profile from Firestore */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) { if (!cancelled) router.push("/profile-setup"); return; }
        if (!cancelled) setProfile(snap.data());
      } catch (e) {
        console.error("Profile fetch error:", e);
        if (!cancelled) setProfile({});
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, router]);

  /* Live notifications from adminNotifications */
  useEffect(() => {
    if (!user?.uid) return;
    setNotifsLoading(true);
    const q = query(
      collection(db, "adminNotifications"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(6)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setNotifications(
          snap.docs.map((d) => ({
            id:        d.id,
            ...d.data(),
            icon:      d.data().icon      || "🔔",
            type:      d.data().type      || "info",
            timestamp: d.data().createdAt?.toDate?.() || new Date(),
          }))
        );
        setNotifsLoading(false);
      },
      (err) => {
        console.error("Notifications error:", err);
        setNotifications([]);
        setNotifsLoading(false);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  /* Live counts from Firestore */
  useEffect(() => {
    if (!user?.uid) return;
    const unsubs = [];

    // User's study notes
    unsubs.push(onSnapshot(
      query(collection(db, "notes"), where("userId", "==", user.uid)),
      (s) => setCardData((p) => ({ ...p, studyNotes: s.size })),
      ()  => setCardData((p) => ({ ...p, studyNotes: 0 }))
    ));

    // Mock tests - get from mockTestAttempts subcollection
    unsubs.push(onSnapshot(
      collection(db, "users", user.uid, "mockTestAttempts"),
      (s) => {
        const attempts = s.docs.map(d => d.data());
        const totalAttempts = attempts.length;
        
        // Calculate weekly progress
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeekCount = attempts.filter(a => {
          const completedAt = a.completedAt?.toDate?.();
          return completedAt && completedAt >= oneWeekAgo;
        }).length;
        
        // Get questions attempted (sum of total questions across all attempts)
        const totalQuestionsAttempted = attempts.reduce((sum, a) => sum + (a.total || 0), 0);
        
        // Calculate subject-wise performance
        const subjectScores = {};
        attempts.forEach(attempt => {
          if (attempt.answers) {
            attempt.answers.forEach(ans => {
              const topic = ans.topic || 'General';
              if (!subjectScores[topic]) {
                subjectScores[topic] = { correct: 0, total: 0 };
              }
              subjectScores[topic].total++;
              if (ans.isCorrect) {
                subjectScores[topic].correct++;
              }
            });
          }
        });
        
        // Find strongest and weakest subjects
        let strongest = null, weakest = null;
        const subjects = Object.entries(subjectScores).filter(([_, data]) => data.total >= 5);
        if (subjects.length > 0) {
          subjects.sort((a, b) => (b[1].correct/b[1].total) - (a[1].correct/a[1].total));
          strongest = { name: subjects[0][0], score: Math.round((subjects[0][1].correct/subjects[0][1].total) * 100) };
          weakest = { name: subjects[subjects.length-1][0], score: Math.round((subjects[subjects.length-1][1].correct/subjects[subjects.length-1][1].total) * 100) };
        }
        
        const avgScore = totalAttempts > 0 
          ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts) 
          : 0;
        const bestScore = totalAttempts > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0;
        
        setCardData((p) => ({ 
          ...p, 
          mockTests: totalAttempts,
          mockTestAvg: avgScore,
          mockTestBest: bestScore,
          mockTestWeekly: thisWeekCount,
          mockTestQuestions: totalQuestionsAttempted,
          mockTestStrongest: strongest,
          mockTestWeakest: weakest
        }));
      },
      (error) => {
        console.error('Error fetching mock test attempts:', error);
        setCardData((p) => ({ ...p, mockTests: 0, mockTestAvg: 0, mockTestBest: 0, mockTestWeekly: 0, mockTestQuestions: 0 }));
      }
    ));

    // PYQ attempts (user subcollection)
    unsubs.push(onSnapshot(
      collection(db, "users", user.uid, "pyqAttempts"),
      (s) => setCardData((p) => ({ ...p, pyq: s.size })),
      ()  => setCardData((p) => ({ ...p, pyq: 0 }))
    ));

    // Active current affairs (global)
    unsubs.push(onSnapshot(
      query(collection(db, "currentAffairs"), where("isActive", "==", true)),
      (s) => setCardData((p) => ({ ...p, currentAffairs: s.size })),
      ()  => setCardData((p) => ({ ...p, currentAffairs: 0 }))
    ));

    return () => unsubs.forEach((u) => u());
  }, [user?.uid]);

  /* Fetch today's planner tasks */
  useEffect(() => {
    if (!user?.uid) return;
    
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    
    const unsub = onSnapshot(
      query(
        collection(db, "users", user.uid, "plannerTasks"),
        where("dateKey", "==", todayKey)
      ),
      (snap) => {
        const tasks = snap.docs.map(d => d.data());
        const completed = tasks.filter(t => t.done).length;
        setTodayTasks({
          total: tasks.length,
          completed,
          pending: tasks.length - completed
        });
        
        // Calculate weekly study hours
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekKey = oneWeekAgo.toISOString().slice(0, 10);
      },
      (err) => console.error("Error fetching today's tasks:", err)
    );
    
    return () => unsub();
  }, [user?.uid]);

  /* Fetch weekly study hours from planner */
  useEffect(() => {
    if (!user?.uid) return;
    
    const fetchWeeklyHours = async () => {
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      try {
        const q = query(
          collection(db, "users", user.uid, "plannerTasks"),
          where("dateKey", ">=", oneWeekAgo.toISOString().slice(0, 10))
        );
        const snap = await getDocs(q);
        const tasks = snap.docs.map(d => d.data());
        const totalMinutes = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
        setWeeklyStudyHours((totalMinutes / 60).toFixed(1));
      } catch (err) {
        console.error("Error fetching weekly hours:", err);
      }
    };
    
    fetchWeeklyHours();
  }, [user?.uid]);

  /* Fetch CA streak and highlights */
  useEffect(() => {
    if (!user?.uid) return;
    
    const fetchCAData = async () => {
      try {
        // Get all CA-related tasks to calculate streak
        const tasksQ = query(
          collection(db, "users", user.uid, "plannerTasks"),
          where("taskType", "==", "ca"),
          orderBy("dateKey", "desc")
        );
        const tasksSnap = await getDocs(tasksQ);
        const caTasks = tasksSnap.docs.map(d => d.data());
        
        // Calculate CA streak
        if (caTasks.length > 0) {
          const completedDates = new Set(
            caTasks.filter(t => t.done).map(t => t.dateKey)
          );
          
          let streak = 0;
          const checkDate = new Date();
          checkDate.setHours(0, 0, 0, 0);
          
          while (true) {
            const key = checkDate.toISOString().slice(0, 10);
            if (completedDates.has(key)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          setCaStreak(streak);
        }
        
        // Get today's CA highlights (top 3 recent CA articles marked important)
        const caQ = query(
          collection(db, "currentAffairs"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const caSnap = await getDocs(caQ);
        const caArticles = caSnap.docs.map(d => ({
          id: d.id,
          title: d.data().title,
          category: d.data().category,
          date: d.data().date
        }));
        setCaHighlights(caArticles);
        
      } catch (err) {
        console.error("Error fetching CA data:", err);
      }
    };
    
    fetchCAData();
  }, [user?.uid]);

  /* Fetch recent activity from multiple sources */
  useEffect(() => {
    if (!user?.uid) return;
    
    const fetchRecentActivity = async () => {
      const activities = [];
      
      try {
        // Get recent planner tasks
        const tasksQ = query(
          collection(db, "users", user.uid, "plannerTasks"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        const tasksSnap = await getDocs(tasksQ);
        tasksSnap.docs.forEach(d => {
          const data = d.data();
          activities.push({
            type: 'task',
            icon: data.done ? '✅' : '⏳',
            title: data.done ? 'Task completed' : 'Task added',
            message: data.title,
            time: data.createdAt?.toDate?.() || new Date(),
            color: data.done ? '#10b981' : '#3b82f6'
          });
        });
        
        // Get recent mock test attempts
        const testsQ = query(
          collection(db, "users", user.uid, "mockTestAttempts"),
          orderBy("completedAt", "desc"),
          limit(2)
        );
        const testsSnap = await getDocs(testsQ);
        testsSnap.docs.forEach(d => {
          const data = d.data();
          activities.push({
            type: 'test',
            icon: '📝',
            title: 'Test attempted',
            message: `${data.score || 0}% score`,
            time: data.completedAt?.toDate?.() || new Date(),
            color: '#8b5cf6'
          });
        });
        
        // Sort by time and take top 5
        activities.sort((a, b) => b.time - a.time);
        setRecentActivity(activities.slice(0, 5));
        
      } catch (err) {
        console.error("Error fetching recent activity:", err);
      }
    };
    
    fetchRecentActivity();
  }, [user?.uid]);

  /* Logout */
  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); router.push("/login"); }
    catch { toast.error("Error logging out."); }
  };

  /* ── Loading screen ── */
  if (authLoading || pageLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f2ee" }}>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2ddd6", borderTopColor: "#c9a84c", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
          <div style={{ marginTop: 16, fontSize: ".88rem", color: "#64748b", fontFamily: "'DM Sans',sans-serif" }}>
            Loading your dashboard…
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* ── Derived values ── */
  const displayName = profile?.fullName || profile?.name || user.email?.split("@")[0] || "Aspirant";
  const prelDays    = daysUntil(EXAM_DATES.prelims);
  const dateStr     = time.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const stats = [
    { icon: "✎", label: "Study Notes",     value: cardData.studyNotes,     bg: "#f0fdf4", color: "var(--emerald)"  },
    { icon: "📝", label: "Tests Practiced", value: cardData.mockTests != null ? `${cardData.mockTests}` : null, bg: "#eff6ff", color: "var(--sapphire)" },
    { icon: "📅", label: "This Week",     value: cardData.mockTestWeekly != null ? `${cardData.mockTestWeekly}` : null,   bg: "#fefce8", color: "#92400e" },
    { icon: "❓", label: "Questions",     value: cardData.mockTestQuestions != null ? `${cardData.mockTestQuestions}` : null, bg: "#f5f3ff", color: "#7c3aed" },
    { icon: "◈", label: "Current Affairs", value: cardData.currentAffairs, bg: "#fff1f2", color: "var(--crimson)"  },
  ];

  const quickLinks = [
    { icon: "◈", label: "Current Affairs", sub: cardData.currentAffairs != null ? `${cardData.currentAffairs} articles` : "Loading…", bg: "#f0fdf4", href: "/student-desk/current-affairs" },
    { icon: "◎", label: "PYQ Papers",      sub: cardData.pyq            != null ? `${cardData.pyq} solved`            : "Loading…", bg: "#eff6ff", href: "/student-desk/pyq"              },
    { icon: "≡", label: "Syllabus",        sub: "GS I–IV",                                                                           bg: "#f5f3ff", href: "/student-desk/syllabus"          },
    { icon: "◷", label: "Mock Tests",      sub: cardData.mockTests != null ? `${cardData.mockTests} tests | ${cardData.mockTestQuestions || 0} Qs` : "Loading…", bg: "#fff1f2", href: "/student-desk/mock-tests"         },
    { icon: "✎", label: "Study Notes",     sub: cardData.studyNotes != null ? `${cardData.studyNotes} notes` : "Loading…",   bg: "#fefce8", href: "/student-desk/notes"              },
    { icon: "⊞", label: "Planner",         sub: "Plan your week",                                                                    bg: "#fdf4ff", href: "/student-desk/planner"            },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="layout">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />

        <main className="main">

          {/* Topbar */}
          <header className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <div>
                <div className="topbar-greeting">{getGreeting()}, {displayName}</div>
                <div className="topbar-date">{dateStr}</div>
              </div>
            </div>
            <div className="topbar-right">
              <div className="avatar">{displayName[0].toUpperCase()}</div>
            </div>
          </header>

          <div className="content">

            {/* Hero */}
            <div className="hero animate">
              <div className="hero-pattern" />
              <div className="hero-accent"  />
              <div className="hero-content">
                <div>
                  <div style={{ fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, fontWeight: 600 }}>
                    Daily Inspiration
                  </div>
                  <p className="hero-quote">"{quote.text}"</p>
                  <div className="hero-quote-author">— {quote.author}</div>
                </div>
                <div className="hero-badge">
                  <div className="hero-badge-num">{prelDays}</div>
                  <div className="hero-badge-label">Days to Prelims</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="section-label animate delay-1">Overview</div>
            <div className="stats-grid animate delay-1">
              {stats.map((s) => (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                  {s.value === null
                    ? <span className="skeleton" style={{ height: 32, width: 60, marginBottom: 8, display: "block" }} />
                    : <div className="stat-value">{s.value}</div>
                  }
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Preparation */}
            <div className="section-label animate delay-2">Preparation</div>
            <div className="two-col animate delay-2">
              <CountdownSection />
              <NotificationsCard notifications={notifications} loading={notifsLoading} />
            </div>

            {/* Today's Tasks & Study Stats */}
            <div className="section-label animate delay-2">Today's Progress</div>
            <div className="two-col animate delay-2" style={{ marginBottom: 28 }}>
              {/* Today's Tasks */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">📋 Today's Tasks</span>
                  <Link href="/student-desk/planner" style={{ fontSize: '.75rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>View Planner →</Link>
                </div>
                <div className="card-body">
                  {todayTasks.total === 0 ? (
                    <div className="no-data">
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎯</div>
                      No tasks for today<br />
                      <Link href="/student-desk/planner" style={{ color: 'var(--gold)', fontSize: '.82rem', fontWeight: 600, marginTop: 8, display: 'inline-block' }}>Add your first task</Link>
                    </div>
                  ) : (
                    <>
                      <div className="tasks-summary">
                        <div>
                          <div className="tasks-count">{todayTasks.completed}/{todayTasks.total}</div>
                          <div className="tasks-label">tasks completed</div>
                        </div>
                        <div className="tasks-progress">
                          <div className="tasks-progress-bar">
                            <div 
                              className="tasks-progress-fill" 
                              style={{ width: `${todayTasks.total > 0 ? (todayTasks.completed / todayTasks.total) * 100 : 0}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="tasks-stats">
                        <div className="tasks-stat completed">
                          ✓ {todayTasks.completed} done
                        </div>
                        <div className="tasks-stat pending">
                          ⏳ {todayTasks.pending} pending
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Study Streak & Hours */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">🔥 Study Streak</span>
                </div>
                <div className="card-body">
                  <div className="streak-row">
                    <div className="streak-item">
                      <span className="streak-icon">📅</span>
                      <div className="streak-info">
                        <div className="streak-count">{weeklyStudyHours}h</div>
                        <div className="streak-label">This week</div>
                      </div>
                    </div>
                    <div className="streak-item">
                      <span className="streak-icon">🔥</span>
                      <div className="streak-info">
                        <div className="streak-count">{caStreak}</div>
                        <div className="streak-label">CA streak</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Performance & CA Highlights */}
            <div className="section-label animate delay-2">Performance</div>
            <div className="two-col animate delay-2" style={{ marginBottom: 28 }}>
              {/* Subject Performance */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">📊 Subject Performance</span>
                </div>
                <div className="card-body performance-card">
                  {cardData.mockTestStrongest || cardData.mockTestWeakest ? (
                    <>
                      {cardData.mockTestStrongest && (
                        <div className="subject-row">
                          <div className="subject-info">
                            <div className="subject-dot" style={{ background: '#10b981' }} />
                            <span className="subject-label">Strongest</span>
                          </div>
                          <span className="subject-score" style={{ color: '#10b981' }}>{cardData.mockTestStrongest.name}: {cardData.mockTestStrongest.score}%</span>
                        </div>
                      )}
                      {cardData.mockTestWeakest && (
                        <div className="subject-row">
                          <div className="subject-info">
                            <div className="subject-dot" style={{ background: '#ef4444' }} />
                            <span className="subject-label">Needs Work</span>
                          </div>
                          <span className="subject-score" style={{ color: '#ef4444' }}>{cardData.mockTestWeakest.name}: {cardData.mockTestWeakest.score}%</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-data">
                      Take mock tests to see your subject performance
                    </div>
                  )}
                </div>
              </div>

              {/* Daily CA Highlights */}
              <div className="card">
                <div className="card-head">
                  <span className="card-title">📰 Today's CA</span>
                  <Link href="/student-desk/current-affairs" style={{ fontSize: '.75rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
                </div>
                <div className="card-body">
                  {caHighlights.length === 0 ? (
                    <div className="no-data">No CA articles available</div>
                  ) : (
                    <div className="ca-highlights-list">
                      {caHighlights.map((article) => (
                        <Link 
                          key={article.id} 
                          href="/student-desk/current-affairs"
                          className="ca-highlight-item"
                        >
                          <span className="ca-highlight-icon">📄</span>
                          <div className="ca-highlight-content">
                            <div className="ca-highlight-title">{article.title}</div>
                            <div className="ca-highlight-meta">{article.category} · {article.date || 'Today'}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="section-label animate delay-3">Recent Activity</div>
            <div className="card animate delay-3" style={{ marginBottom: 28 }}>
              <div className="card-body">
                {recentActivity.length === 0 ? (
                  <div className="no-data">No recent activity. Start by adding tasks or taking a test!</div>
                ) : (
                  <div className="activity-list">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <span className="activity-icon">{activity.icon}</span>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-message">{activity.message}</div>
                          <div className="activity-time">{formatRelative(activity.time)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick access */}
            <div className="section-label animate delay-3">Quick Access</div>
            <div className="quick-grid animate delay-3">
              {quickLinks.map((q) => (
                <Link
                  href={q.href}
                  className="quick-card"
                  key={q.label}
                  style={{
                    background: `linear-gradient(white,white) padding-box, linear-gradient(135deg,${q.bg},var(--paper-3)) border-box`,
                    border: "1px solid transparent",
                  }}
                >
                  <div className="quick-icon" style={{ background: q.bg }}>{q.icon}</div>
                  <div className="quick-label">{q.label}</div>
                  <div className="quick-sub">{q.sub}</div>
                </Link>
              ))}
            </div>

          </div>
        </main>
      </div>
    </>
  );
}