import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/config";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import {
  Users, FileText, Newspaper, Bell, ClipboardCheck, BookOpen, ArrowUpRight, LogOut,
  Home, Sparkles, TrendingUp, Coffee, Shield, Loader2, Map
} from "lucide-react";

const ACTIONS = [
  { href:"/admin/notes",           icon:BookOpen,       label:"Notes & PDFs",    desc:"Manage study notes subjects and PDFs",    tone:"violet" },
  { href:"/admin/books",           icon:BookOpen,       label:"Books Library",   desc:"Manage public UPSC book listings",       tone:"blue" },
  { href:"/admin/current-affairs", icon:Newspaper,      label:"Current Affairs", desc:"Publish and manage news articles",         tone:"green" },
  { href:"/admin/maps",            icon:Map,            label:"Maps & Atlas",    desc:"Upload and publish UPSC map resources",    tone:"cyan" },
  { href:"/admin/notifications",   icon:Bell,           label:"Notifications",   desc:"Send alerts to all students",              tone:"blue" },
  { href:"/admin/mock-tests",      icon:ClipboardCheck, label:"Mock Tests",      desc:"Create and manage practice tests",         tone:"pink" },
  { href:"/admin/pyq",             icon:FileText,       label:"PYQ Papers",      desc:"Upload previous year questions",           tone:"amber" },
  { href:"/admin/users",           icon:Users,          label:"Users",           desc:"Manage user accounts and roles",           tone:"cyan" },
];

const TONE = {
  violet: { bg:'var(--cat-violet-t)', fg:'var(--cat-violet)' },
  blue:   { bg:'var(--cat-blue-t)',   fg:'var(--cat-blue)'   },
  green:  { bg:'var(--cat-green-t)',  fg:'var(--cat-green)'  },
  pink:   { bg:'var(--cat-pink-t)',   fg:'var(--cat-pink)'   },
  cyan:   { bg:'var(--cat-cyan-t)',   fg:'var(--cat-cyan)'   },
  amber:  { bg:'var(--cat-amber-t)',  fg:'#B45309'           },
  lime:   { bg:'var(--cat-lime-t)',   fg:'var(--cat-lime)'   },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({ users:0, currentAffairs:0, maps:0, mockTests:0, pyqs:0, notifications:0, pdfSubjects:0, books:0, bookSubjects:0 });

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  useEffect(() => {
    if (!authLoading && !user && !demoMode) { router.replace("/login"); return; }
    if (demoMode && !user) {
      setIsAdmin(true);
      setProfile({ fullName: 'Demo Admin' });
      setLoading(false);
      return;
    }
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists() || !snap.data().isAdmin) {
          if (!cancelled) router.replace("/");
          return;
        }
        if (!cancelled) { setProfile(snap.data()); setIsAdmin(true); }
      } catch {
        if (!cancelled) router.replace("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, router, demoMode]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubs = [];
    const wire = (name, extraWhere) => {
      try {
        let q1 = collection(db, name);
        if (extraWhere) q1 = query(q1, where(...extraWhere));
        unsubs.push(onSnapshot(q1, s => setStats(p => ({ ...p, [name === 'adminNotifications' ? 'notifications' : name]: s.size })), () => {}));
      } catch {}
    };
    wire('users');
    wire('currentAffairs', ['isActive', '==', true]);
    wire('maps', ['status', '==', 'published']);
    wire('mockTests');
    wire('pyqs');
    wire('adminNotifications', ['isActive', '==', true]);
    wire('pdfSubjects');
    wire('books');
    wire('bookSubjects');
    return () => unsubs.forEach(u => u());
  }, [isAdmin]);

  const handleLogout = async () => {
    try { await logout(); router.push("/login"); } catch {}
  };

  if (loading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }
  if (!isAdmin) return null;

  const displayName = profile?.fullName || profile?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="grad-ink-glow" style={{ color: 'var(--color-bg)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #4F46E5 0%, #EC4899 100%)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Coffee size={20} strokeWidth={1.6} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="hero-display text-[20px]" style={{ color: '#fff' }}>Notes Cafe</span>
              <span className="text-[10px] font-mono mt-0.5 flex items-center gap-1.5" style={{ color: '#B7BFB8', letterSpacing: '0.14em' }}>
                <Shield size={10} /> ADMIN · CONTROL ROOM
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/student-desk/dashboard" className="btn btn-ghost"
                  style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                  data-testid="admin-view-site">
              <Home size={14} strokeWidth={1.6} /> View site
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost"
                    style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                    data-testid="admin-logout">
              <LogOut size={14} strokeWidth={1.6} /> Logout
            </button>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-6 md:px-10 pb-10">
          <div className="chip" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.15)' }}>
            <Sparkles size={11} /> Welcome back
          </div>
          <h1 className="hero-display mt-4" style={{ fontSize: 'clamp(32px, 4vw, 52px)', color: '#fff', lineHeight: 1.05, letterSpacing: '-0.035em' }}>
            Hello, <span className="grad-text">{displayName}</span>.<br />
            Your control room, one place.
          </h1>
          <p className="mt-4 text-[15px] max-w-[560px]" style={{ color: '#B7BFB8' }}>
            Publish an article, launch a mock, notify students. Everything you push here shows up on the student desk in real time.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-6 md:px-10 py-10">
        {/* Live stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {[
            { label:"Users",         value:stats.users,          tone:'cyan',   icon:Users },
            { label:"Note subjects", value:stats.pdfSubjects,    tone:'violet', icon:BookOpen },
            { label:"Book subjects", value:stats.bookSubjects,   tone:'blue',   icon:BookOpen },
            { label:"Books",         value:stats.books,          tone:'blue',   icon:FileText },
            { label:"Current affairs",value:stats.currentAffairs, tone:'green',  icon:Newspaper },
            { label:"Maps",          value:stats.maps,           tone:'cyan',   icon:Map },
            { label:"Mock tests",    value:stats.mockTests,      tone:'pink',   icon:ClipboardCheck },
            { label:"PYQs",          value:stats.pyqs,           tone:'amber',  icon:FileText },
            { label:"Notifications", value:stats.notifications,  tone:'blue',   icon:Bell },
          ].map((s, i) => {
            const t = TONE[s.tone];
            return (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .3, delay: i * 0.04 }}
                className="card p-4 md:p-5"
                data-testid={`admin-stat-${s.label.toLowerCase().replace(/\s/g,'-')}`}>
                <div className="flex items-center justify-between mb-3">
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: t.bg, color: t.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <s.icon size={16} strokeWidth={1.6} />
                  </div>
                  <TrendingUp size={12} style={{ color: 'var(--color-ink-faint)' }} />
                </div>
                <div className="display-num text-[30px]" style={{ color: 'var(--color-ink)' }}>{s.value}</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--color-ink-muted)' }}>{s.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="eyebrow mb-1">Quick actions</div>
              <div className="hero-display text-[22px]" style={{ letterSpacing: '-0.025em' }}>What are we shipping today?</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACTIONS.map((a, i) => {
              const t = TONE[a.tone];
              return (
                <motion.div key={a.href}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: .35, delay: i * 0.04 }}>
                  <Link href={a.href} legacyBehavior>
                  <a className="card card-hover p-5 flex items-start gap-4 h-full block" data-testid={`admin-action-${a.tone}`}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 16,
                      background: t.bg, color: t.fg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <a.icon size={22} strokeWidth={1.6} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans" style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>{a.label}</span>
                        <ArrowUpRight size={14} strokeWidth={1.75} style={{ color: 'var(--color-ink-faint)' }} />
                      </div>
                      <div className="text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>{a.desc}</div>
                    </div>
                  </a>
                </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Guide */}
        <div className="mt-10 card p-6 md:p-8 grad-ink-glow" style={{ color: '#fff', borderColor: 'transparent' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="eyebrow" style={{ color: '#B7BFB8' }}>Content playbook</div>
              <div className="hero-display mt-2" style={{ fontSize: 26, letterSpacing: '-0.025em', color: '#fff' }}>
                A one-minute guide to publishing.
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:Newspaper, title:"Current Affairs", body:"Go to Current Affairs → New Article. Add title, category, summary, tags, then activate." },
              { icon:BookOpen,  title:"Notes & PDFs",    body:"Notes → Add Subject → attach PDFs by title & URL." },
              { icon:ClipboardCheck, title:"Mock Tests", body:"Mock Tests → Create → add questions manually or import CSV." },
              { icon:FileText,  title:"PYQ Papers",      body:"PYQ → Upload → select exam, year, and drop the PDF." },
              { icon:Bell,      title:"Notifications",   body:"Notifications → New → pick type, write message, activate." },
              { icon:Users,     title:"User roles",      body:"Users → toggle admin, disable accounts, or check profiles." },
            ].map((g, i) => (
              <div key={i} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <g.icon size={16} strokeWidth={1.6} style={{ color: '#F97066' }} />
                  <span className="font-sans" style={{ fontWeight: 700, color: '#fff' }}>{g.title}</span>
                </div>
                <div className="text-[13px]" style={{ color: '#B7BFB8', lineHeight: 1.55 }}>{g.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
