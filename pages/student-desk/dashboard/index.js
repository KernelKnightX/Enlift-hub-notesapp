// pages/student-desk/dashboard/index.jsx (Armed Forces Exam Preparation Dashboard)
'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import Sidebar from "../../../components/common/sidebar";

import { db } from "../../../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

/* ------------------------------ Helpers ------------------------------ */

const motivationalQuotes = [
  { text: "The brave may not live forever, but the cautious do not live at all.", author: "Harsh Joshi" },
  { text: "Courage is not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The only easy day was yesterday.", author: "Navy SEALs" },
  { text: "Victory belongs to the most persevering.", author: "Napoleon Bonaparte" },
  { text: "I will prepare and someday my chance will come.", author: "Abraham Lincoln" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The more you sweat in peace, the less you bleed in war.", author: "Military Proverb" },
  { text: "A hero is no braver than an ordinary man, but he is brave five minutes longer.", author: "Ralph Waldo Emerson" },
];

// Armed Forces Exam Dates (Update these as per actual exam schedules)
const EXAM_DATES = {
  nda: new Date("2026-04-20"),
  cds: new Date("2026-02-15"),
  afcat: new Date("2026-08-28"),
};

function daysUntil(date) {
  const today = new Date();
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
  return diff > 0 ? diff : 0;
}

function formatRelative(ts) {
  const now = new Date();
  const diff = now.getTime() - new Date(ts).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (seconds < 60) return `Just now`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  // For older activities, show exact date
  const date = new Date(ts);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function formatDateTime() {
  const now = new Date();
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return now.toLocaleString('en-IN', options);
}

/* ---------------------------- Main Component ---------------------------- */

const StudentDashboardComponent = () => {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState(formatDateTime());

  // Authentication guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Cards / counts
  const [cardData, setCardData] = useState({
    mockTests: 0,
    studyNotes: 0,
    pyq: 0,
    syllabus: 0,
    ssb: 0,
    currentAffairs: 0,
  });

  // Notifications from admin
  const [notifications, setNotifications] = useState([]);

  // Quote rotation
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);

  /* ------------------------- Update Date/Time & Live Timestamps ------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(formatDateTime());
    }, 60000); // Update every minute instead of every second to prevent excessive re-renders
    return () => clearInterval(interval);
  }, []);

  /* ------------------------- Rotate Quotes Every 2 Minutes ------------------------- */
  useEffect(() => {
    const rotateQuote = () => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setCurrentQuote(motivationalQuotes[randomIndex]);
    };

    rotateQuote(); // Set initial random quote

    const interval = setInterval(rotateQuote, 120000); // 2 minutes = 120000ms
    return () => clearInterval(interval);
  }, []);

  /* ------------------------- Load profile & guard ------------------------- */
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          if (!cancelled) router.push("/profile-setup");
          return;
        }
        if (!cancelled) setProfile(snap.data());
      } catch (e) {
        console.error("Profile fetch error:", e);
        if (!cancelled) setProfile({ name: "Officer" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
      toast.error("Error logging out. Please try again.");
    }
  };

  /* -------------------------- Real-time listeners ------------------------- */

  // Admin Notifications (from admin panel)
  useEffect(() => {
    if (!user?.uid) return;
    
    // Listen to global notifications from admin
    const qRef = query(
      collection(db, "adminNotifications"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        try {
          const arr = [];
          snap.forEach((d) => {
            const n = d.data();
            arr.push({
              id: d.id,
              title: n.title,
              message: n.message,
              type: n.type || "info",
              timestamp: n.createdAt?.toDate?.() || new Date(),
              icon: n.icon || "🔔",
            });
          });
          setNotifications(arr);
        } catch (error) {
          console.error("Error processing notifications:", error);
          setNotifications([]);
        }
      },
      (err) => {
        console.error("Notifications listener error:", err);
        setNotifications([]);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  // Removed activity tracking completely to prevent Fast Refresh issues
  // Activities can be tracked in production based on actual user actions

  // Card counts
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribers = [];

    try {
      // Mock Tests count
      const mockTestsUnsub = onSnapshot(
        collection(db, "users", user.uid, "mockTests"),
        (snap) => {
          try {
            setCardData((p) => ({ ...p, mockTests: snap.size }));
          } catch (error) {
            console.error("Error processing mock tests count:", error);
          }
        },
        (error) => {
          console.error("Mock tests listener error:", error);
          // Don't retry automatically
        }
      );
      unsubscribers.push(mockTestsUnsub);

      // Study Notes count
      const qNotes = query(collection(db, "notes"), where("userId", "==", user.uid));
      const studyNotesUnsub = onSnapshot(
        qNotes,
        (snap) => {
          try {
            setCardData((p) => ({ ...p, studyNotes: snap.size }));
          } catch (error) {
            console.error("Error processing study notes count:", error);
          }
        },
        (error) => {
          console.error("Study notes listener error:", error);
          // Don't retry automatically
        }
      );
      unsubscribers.push(studyNotesUnsub);

      // PYQ count
      const pyqUnsub = onSnapshot(
        collection(db, "users", user.uid, "pyqAttempts"),
        (snap) => {
          try {
            setCardData((p) => ({ ...p, pyq: snap.size }));
          } catch (error) {
            console.error("Error processing PYQ count:", error);
          }
        },
        (error) => {
          console.error("PYQ listener error:", error);
          // Don't retry automatically
        }
      );
      unsubscribers.push(pyqUnsub);

    } catch (error) {
      console.error("Setup error:", error);
    }

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [user?.uid]);

  // Removed login streak tracking to prevent Fast Refresh issues
  // Can be added back as a separate feature if needed

  /* -------------------------------- Render -------------------------------- */

  if (authLoading || loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f8f9fa" }}>
        <div className="text-center">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }} />
          <div className="mt-3 text-muted fw-semibold">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: '280px' }}>
        <div className="container-fluid py-3 px-2 px-md-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
          {/* Header - Mobile Optimized */}
          <div className="card shadow-sm border-0 mb-3" style={{ background: "white" }}>
            <div className="card-body p-3">
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                <div className="w-100 w-md-auto">
                  <h1 className="h5 mb-2 fw-bold" style={{ color: "#2d3748" }}>
                    Welcome to Defense Aspirant! 🎖️
                  </h1>
                  <div className="d-flex flex-wrap align-items-center gap-2 small">
                    <span className="badge" style={{ background: "#10b981", color: "white" }}>Defense Aspirant</span>
                  </div>
                </div>
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 w-100 w-md-auto">
                  <div className="text-start text-sm-end flex-grow-1">
                    <div className="small text-muted mb-1">📅 Current Date & Time</div>
                    <div className="small fw-bold" style={{ color: "#10b981", lineHeight: 1.3 }}>
                      {currentDateTime}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm fw-semibold d-flex align-items-center gap-1"
                    style={{
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      padding: "6px 16px"
                    }}
                    onClick={handleLogout}
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Countdown & Motivation Row */}
          <div className="row g-2 g-md-3 mb-3">
            {/* Armed Forces Exam Countdown */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm" style={{ background: "white" }}>
                <div className="card-body p-3">
                  <h3 className="h6 fw-bold mb-3" style={{ color: "#2d3748" }}>
                    🎯 Armed Forces Exam Countdown
                  </h3>
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#f0fdf4" }}>
                        <div className="rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: "#10b981", color: "white" }}>
                          <span style={{ fontSize: '1.2rem' }}>🎖️</span>
                        </div>
                        <div>
                          <div className="fw-semibold small" style={{ color: "#2d3748" }}>NDA Exam</div>
                          <div className="small" style={{ color: "#10b981" }}>{daysUntil(EXAM_DATES.nda)} days left</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#f0f9ff" }}>
                        <div className="rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: "#3b82f6", color: "white" }}>
                          <span style={{ fontSize: '1.2rem' }}>🪖</span>
                        </div>
                        <div>
                          <div className="fw-semibold small" style={{ color: "#2d3748" }}>CDS Exam</div>
                          <div className="small" style={{ color: "#3b82f6" }}>{daysUntil(EXAM_DATES.cds)} days left</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="d-flex align-items-center gap-2 p-2 rounded" style={{ background: "#fef3c7" }}>
                        <div className="rounded d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: "#f59e0b", color: "white" }}>
                          <span style={{ fontSize: '1.2rem' }}>✈️</span>
                        </div>
                        <div>
                          <div className="fw-semibold small" style={{ color: "#2d3748" }}>AFCAT Exam</div>
                          <div className="small" style={{ color: "#f59e0b" }}>{daysUntil(EXAM_DATES.afcat)} days left</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Motivation */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm h-100" style={{ background: "white" }}>
                <div className="card-body text-center p-3 d-flex flex-column justify-content-center">
                  <div className="mb-2" style={{ fontSize: '2.5rem' }}>💡</div>
                  <h3 className="h6 mb-2" style={{ color: "#2d3748" }}>Daily Motivation</h3>
                  <p className="fst-italic small mb-1" style={{ color: "#6b7280" }}>"{currentQuote.text}"</p>
                  <div className="small fw-semibold" style={{ color: "#10b981" }}>— {currentQuote.author}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="row g-2 g-md-3 mb-3">
            <div className="col-6 col-md-4 col-lg-2">
              <NavCard
                title="Study Notes"
                icon="📝"
                count={cardData.studyNotes}
                href="/student-desk/notes"
                bgColor="#f0fdf4"
                iconBg="#10b981"
              />
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <NavCard
                title="Mock Tests"
                icon="📋"
                href="/student-desk/mock-tests"
                bgColor="#fef3c7"
                iconBg="#f59e0b"
              />
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <NavCard
                title="PYQ's"
                icon="📊"
                href="/student-desk/pyq"
                bgColor="#f0f9ff"
                iconBg="#3b82f6"
              />
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <NavCard
                title="Syllabus"
                icon="📚"
                href="/student-desk/syllabus"
                bgColor="#f3e8ff"
                iconBg="#a855f7"
              />
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <NavCard
                title="SSB Practice"
                icon="🎯"
                href="/student-desk/ssb-practice"
                bgColor="#ede9fe"
                iconBg="#8b5cf6"
              />
            </div>
            <div className="col-6 col-md-4 col-lg-2">
              <NavCard
                title="SSB Repetition"
                icon="🔄"
                href="/student-desk/ssb-repetition"
                bgColor="#fee2e2"
                iconBg="#ef4444"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="row g-2 g-md-3">
            <div className="col-12">
              <NotificationsCard notifications={notifications} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Child Components --------------------------- */

const NavCard = ({ title, icon, count, href, bgColor, iconBg, external = false }) => {
  const handleClick = (e) => {
    if (external) {
      e.preventDefault();
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const CardContent = () => (
    <div
      className="card h-100 border-0 shadow-sm text-center"
      style={{
        background: "white",
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
      }}
    >
      <div className="card-body p-3">
        <div
          className="mx-auto d-flex align-items-center justify-content-center rounded mb-2"
          style={{ width: 50, height: 50, background: bgColor }}
        >
          <div
            className="rounded d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, background: iconBg, color: "white" }}
          >
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
          </div>
        </div>
        <div className="fw-semibold small" style={{ color: "#2d3748" }}>{title}</div>
        {title === "Study Notes" && <div className="small fw-bold" style={{ color: iconBg }}>{count || 0}</div>}
        {external && (
          <div className="small" style={{ color: "#6b7280", marginTop: '2px' }}>
            <span style={{ fontSize: '0.7rem' }}>🔗 External</span>
          </div>
        )}
      </div>
    </div>
  );

  if (external) {
    return (
      <div className="text-decoration-none" onClick={handleClick}>
        <CardContent />
      </div>
    );
  }

  return (
    <Link href={href} className="text-decoration-none">
      <CardContent />
    </Link>
  );
}


const NotificationsCard = ({ notifications }) => {
  const getColorScheme = (type) => {
    switch(type) {
      case "success": return { bg: "#f0fdf4", border: "#10b981", icon: "#10b981" };
      case "warning": return { bg: "#fef3c7", border: "#f59e0b", icon: "#f59e0b" };
      case "error": return { bg: "#fee2e2", border: "#ef4444", icon: "#ef4444" };
      default: return { bg: "#f0f9ff", border: "#3b82f6", icon: "#3b82f6" };
    }
  };

  return (
    <div className="card border-0 shadow-sm" style={{ background: "white" }}>
      <div className="card-header border-0 p-3 d-flex align-items-center justify-content-between" style={{ background: "white" }}>
        <h3 className="h6 m-0 fw-bold" style={{ color: "#2d3748" }}>
          🔔 Admin Notifications
        </h3>
        {notifications.length > 0 && (
          <span className="badge" style={{ background: "#ef4444", color: "white" }}>
            {notifications.length}
          </span>
        )}
      </div>
      <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div className="text-center text-muted py-5 px-3">
            <div style={{ fontSize: '3rem' }} className="mb-2">🔕</div>
            <div className="fw-semibold" style={{ color: "#6b7280" }}>No notifications</div>
            <div className="small" style={{ color: "#9ca3af" }}>You're all caught up!</div>
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {notifications.map((n) => {
              const colors = getColorScheme(n.type);
              return (
                <li 
                  key={n.id} 
                  className="list-group-item p-3 border-0" 
                  style={{ 
                    borderLeft: `4px solid ${colors.border}`,
                    background: colors.bg,
                    borderBottom: "1px solid #f3f4f6"
                  }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <div
                      className="rounded d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 36, height: 36, background: "white" }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{n.icon}</span>
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="small fw-semibold" style={{ color: "#2d3748" }}>
                        {n.title}
                      </div>
                      <div className="small" style={{ color: "#6b7280" }}>
                        {n.message}
                      </div>
                      <div className="small" style={{ color: colors.icon }}>
                        {formatRelative(n.timestamp)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return <StudentDashboardComponent />;
}
