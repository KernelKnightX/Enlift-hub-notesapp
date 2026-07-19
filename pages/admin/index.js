import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase/config";
import { db } from "../../firebase/config";
import {
  collection, query, where, onSnapshot, doc, getDoc, orderBy, limit,
} from "firebase/firestore";

const QUICK_ACTIONS = [
  { href: "/admin/notes", icon: "📝", label: "Notes & PDFs", desc: "Manage study notes subjects & PDFs", color: "#7c3aed", bg: "#f5f3ff" },
  { href: "/admin/current-affairs", icon: "📰", label: "Current Affairs", desc: "Publish & manage news articles", color: "#10b981", bg: "#f0fdf4" },
  { href: "/admin/notifications",   icon: "📢", label: "Notifications",   desc: "Send alerts to all students",   color: "#3b82f6", bg: "#eff6ff" },
  { href: "/admin/mock-tests",      icon: "📋", label: "Mock Tests",      desc: "Create & manage practice tests", color: "#8b5cf6", bg: "#f5f3ff" },
  { href: "/admin/pyq",             icon: "📄", label: "PYQ Papers",      desc: "Upload previous year questions", color: "#f59e0b", bg: "#fefce8" },
  { href: "/admin/users",           icon: "👥", label: "Users",           desc: "Manage user accounts & roles",   color: "#ef4444", bg: "#fff1f2" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Real stats
  const [stats, setStats] = useState({
    users: 0,
    currentAffairs: 0,
    mockTests: 0,
    pyqs: 0,
    notifications: 0,
    pdfSubjects: 0,
  });

  // Server-side admin verification
  const verifyAdminServerSide = useCallback(async (user) => {
    try {
      // The `user` from our AuthContext is a plain object (no methods).
      // Prefer using the real Firebase Auth currentUser to get a token.
      let idToken = null;

      if (user && typeof user.getIdToken === 'function') {
        idToken = await user.getIdToken();
      } else if (auth?.currentUser && typeof auth.currentUser.getIdToken === 'function') {
        idToken = await auth.currentUser.getIdToken();
      } else {
        // No token available
        return { isAdmin: null, profile: null, error: 'no_token_available' };
      }

      const response = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (response.ok && data.isAdmin) {
        return { isAdmin: true, profile: data.userData };
      } else {
        return { isAdmin: false, profile: null, error: data.error };
      }
    } catch (error) {
      console.error('Server-side admin verification failed:', error);
      // Fall back to client-side check
      return { isAdmin: null, profile: null, error: 'verification_error' };
    }
  }, []);

  /* ── Auth + admin guard (with server-side verification) ── */
  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        // First try server-side verification
        const serverResult = await verifyAdminServerSide(user);
        
        if (!cancelled) {
          if (serverResult.isAdmin === true) {
            setProfile(serverResult.profile);
            setIsAdmin(true);
            setLoading(false);
            return;
          } else if (serverResult.isAdmin === false) {
            toast.error("Admin access required.");
            router.replace("/");
            return;
          }
          // If serverResult.isAdmin === null, fall back to client-side
        }

        // Fallback to client-side check
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists() || !snap.data().isAdmin) {
          toast.error("Admin access required.");
          if (!cancelled) router.replace("/");
          return;
        }
        if (!cancelled) { setProfile(snap.data()); setIsAdmin(true); }
      } catch (e) {
        console.error(e);
        if (!cancelled) router.replace("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, router, verifyAdminServerSide]);

  /* ── Real-time stats ── */
  useEffect(() => {
    if (!isAdmin) return;
    const unsubs = [];

    unsubs.push(onSnapshot(collection(db, "users"),
      s => setStats(p => ({ ...p, users: s.size })), () => {}));

    unsubs.push(onSnapshot(query(collection(db, "currentAffairs"), where("isActive", "==", true)),
      s => setStats(p => ({ ...p, currentAffairs: s.size })), () => {}));

    unsubs.push(onSnapshot(collection(db, "mockTests"),
      s => setStats(p => ({ ...p, mockTests: s.size })), () => {}));

    unsubs.push(onSnapshot(collection(db, "pyqs"),
      s => setStats(p => ({ ...p, pyqs: s.size })), () => {}));

    unsubs.push(onSnapshot(query(collection(db, "adminNotifications"), where("isActive", "==", true)),
      s => setStats(p => ({ ...p, notifications: s.size })), () => {}));

    unsubs.push(onSnapshot(collection(db, "pdfSubjects"),
      s => setStats(p => ({ ...p, pdfSubjects: s.size })), () => {}));

    return () => unsubs.forEach(u => u());
  }, [isAdmin]);

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); router.push("/login"); }
    catch { toast.error("Error logging out."); }
  };

  if (loading || authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f4f8" }}>
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }
  if (!isAdmin) return null;

  const displayName = profile?.fullName || profile?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh" }}>

      {/* Header */}
      <div
        className="px-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)", boxShadow: "0 2px 12px rgba(30,58,95,.3)" }}
      >
        <div>
          <h1 className="h5 fw-bold mb-1 text-white">🎯 Admin Panel</h1>
          <div className="small" style={{ color: "rgba(255,255,255,.7)" }}>
            Welcome back, {displayName}
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link
            href="/student-desk/dashboard"
            className="btn btn-sm"
            style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}
          >
            🏠 View Site
          </Link>
          <button
            className="btn btn-sm"
            style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="container-fluid px-3 px-md-4 py-4">

        {/* Live Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Users",      value: stats.users,         color: "#3b82f6", icon: "👥" },
            { label: "Notes Subjects",  value: stats.pdfSubjects,   color: "#7c3aed", icon: "📝" },
            { label: "Current Affairs",  value: stats.currentAffairs, color: "#10b981", icon: "📰" },
            { label: "Mock Tests",       value: stats.mockTests,      color: "#8b5cf6", icon: "📋" },
            { label: "PYQ Papers",       value: stats.pyqs,           color: "#f59e0b", icon: "📄" },
          ].map((s) => (
            <div key={s.label} className="col-6 col-md-4 col-lg">
              <div className="card border-0 shadow-sm h-100" style={{ background: "white" }}>
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: s.color + "18", fontSize: "1.4rem" }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="h5 fw-bold mb-0" style={{ color: s.color }}>{s.value}</div>
                    <div className="small text-muted">{s.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h3 className="h6 fw-bold mb-3" style={{ color: "#1e3a5f" }}>⚡ Quick Actions</h3>
        <div className="row g-3 mb-4">
          {QUICK_ACTIONS.map((action) => (
            <div key={action.href} className="col-12 col-sm-6 col-lg-4">
              <Link href={action.href} className="text-decoration-none">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ background: "white", transition: "transform .18s, box-shadow .18s", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div className="card-body p-4 d-flex align-items-center gap-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 56, height: 56, background: action.bg, fontSize: "1.8rem" }}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <div className="fw-bold mb-1" style={{ color: "#1f2937" }}>{action.label}</div>
                      <div className="small text-muted">{action.desc}</div>
                    </div>
                    <div className="ms-auto">
                      <i className="bi bi-chevron-right text-muted" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="card border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)" }}>
          <div className="card-body p-4 text-white">
            <h5 className="fw-bold mb-2">📋 Content Management Guide</h5>
            <div className="row g-3">
              {[
                { icon: "📝", title: "Notes & PDFs",  desc: "Go to Notes → Add Subject. Create subjects then add PDFs with titles and URLs." },
                { icon: "📰", title: "Current Affairs", desc: "Go to Current Affairs → New Article. Fill title, category, summary, tags and publish." },
                { icon: "📢", title: "Notifications",  desc: "Go to Notifications → New Notification. Choose type and icon, write message and activate." },
                { icon: "📋", title: "Mock Tests",     desc: "Go to Mock Tests → Create Test. Add questions manually or import from CSV." },
                { icon: "📄", title: "PYQ Papers",     desc: "Go to PYQ → Upload PYQ. Select exam type, year and upload PDF file." },
              ].map((g) => (
                <div key={g.title} className="col-12 col-sm-6 col-lg-3">
                  <div className="d-flex gap-2">
                    <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>{g.icon}</span>
                    <div>
                      <div className="fw-semibold small">{g.title}</div>
                      <div className="small" style={{ color: "rgba(255,255,255,.7)", fontSize: "0.75rem" }}>{g.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
