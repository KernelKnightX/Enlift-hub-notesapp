import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Newspaper, FileText, ClipboardCheck, BookOpen,
  Calendar as CalendarIcon, User as UserIcon,
  Coffee, Menu, X, LogOut, Search, Bell, ChevronRight, Command,
  RotateCcw, BarChart3,
} from 'lucide-react';

const NAV = [
  { label: 'Dashboard',       icon: LayoutDashboard, href: '/student-desk/dashboard' },
  { label: 'Current Affairs', icon: Newspaper,       href: '/student-desk/current-affairs' },
  { label: 'PYQ Papers',      icon: FileText,        href: '/student-desk/pyq' },
  { label: 'Mock Tests',      icon: ClipboardCheck,  href: '/student-desk/mock-tests' },
  { label: 'Study Notes',     icon: BookOpen,        href: '/student-desk/notes' },
  { label: 'Mistake Notebook', icon: RotateCcw,       href: '/student-desk/mistake-notebook' },
  { label: 'Weakness Analyzer', icon: BarChart3,     href: '/student-desk/analytics' },
  { label: 'Planner',         icon: CalendarIcon,    href: '/student-desk/planner' },
  { label: 'Profile',         icon: UserIcon,        href: '/student-desk/profile' },
];

const DEMO_USER = {
  uid: 'demo-user',
  email: 'aspirant@notescafe.in',
  fullName: 'Priya Sharma',
  examType: 'UPSC_CSE_PRELIMS',
  targetYear: '2026',
  city: 'Delhi',
  isPlus: false,
};

export default function StudentLayout({ children, title, subtitle }) {
  const router = useRouter();
  const { user: realUser, logout, authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const user = realUser || (demoMode ? DEMO_USER : null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => { setOpen(false); }, [router.pathname]);

  useEffect(() => {
    if (!authLoading && !user && !demoMode) router.replace('/login');
  }, [authLoading, user, demoMode, router]);

  const initials = useMemo(() => {
    const name = user?.fullName || user?.email || 'A';
    return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    try { await logout(); router.push('/login'); } catch (e) { console.error(e); }
  };

  const [searchValue, setSearchValue] = useState('');
  const today = useMemo(() => new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }), []);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex' }}>
      {/* Sidebar backdrop (mobile) */}
      <AnimatePresence>
        {open && isMobile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,22,19,0.35)', zIndex: 40 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        data-testid="app-sidebar"
        style={{
          width: 264, flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          padding: '20px 16px',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0, left: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 50,
          transform: isMobile ? (open ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform .28s cubic-bezier(.2,.7,.2,1)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div className="flex items-center justify-between px-2 py-1">
          <Link href="/" className="flex items-center gap-2.5" data-testid="sidebar-logo">
            <div style={{
              width: 34, height: 34, borderRadius: 10, background: 'var(--color-primary)', color: 'var(--color-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Coffee size={17} strokeWidth={1.6} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[18px]" style={{ letterSpacing: '-0.02em' }}>Notes Cafe</span>
              <span className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.16em' }}>STUDENT · DESK</span>
            </div>
          </Link>
          {isMobile && (
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'transparent', border: 'none' }}>
              <X size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="mt-8 px-1">
          <div className="text-[10.5px] font-mono px-2.5 mb-2" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>
            NAVIGATE
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map(item => {
              const active = router.pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                      className={`side-link ${active ? 'active' : ''}`}
                      data-testid={`sidebar-${item.label.toLowerCase().replace(/\s/g,'-')}`}>
                  <item.icon size={16} strokeWidth={1.6} />
                  <span className="flex-1">{item.label}</span>
                  <span className="side-link-dot" />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-6">
          <button onClick={handleLogout} className="side-link w-full"
                  style={{ color: 'var(--color-ink-muted)' }} data-testid="sidebar-logout">
            <LogOut size={16} strokeWidth={1.6} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header
          className="sticky top-0 z-30"
          style={{
            background: 'rgba(253,252,247,0.85)',
            backdropFilter: 'saturate(140%) blur(12px)',
            WebkitBackdropFilter: 'saturate(140%) blur(12px)',
            borderBottom: '1px solid var(--color-border)',
            padding: '14px 20px'
          }}
        >
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={() => setOpen(true)} data-testid="topbar-menu"
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-ink)' }}>
                <Menu size={20} strokeWidth={1.5} />
              </button>
            )}
            <div>
              <div className="text-[11.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>
                {today.toUpperCase()}
              </div>
              <div className="font-serif text-[19px] md:text-[21px]" style={{ letterSpacing: '-0.01em' }} data-testid="topbar-title">
                {title || 'Welcome back'}{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
                   style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', width: 280 }}>
                <Search size={15} strokeWidth={1.5} style={{ color: 'var(--color-ink-muted)' }} />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const query = searchValue.trim();
                      if (query) router.push(`/student-desk/notes?q=${encodeURIComponent(query)}`);
                    }
                  }}
                  placeholder="Search notes, mocks, current affairs…"
                  className="bg-transparent outline-none text-[13px] flex-1"
                  style={{ color: 'var(--color-ink)' }}
                  data-testid="topbar-search"
                />
                <span className="kbd">⌘K</span>
              </div>
              <button className="p-2 rounded-xl"
                      onClick={() => router.push('/student-desk/notifications')}
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-ink-muted)' }}
                      data-testid="topbar-bell">
                <Bell size={16} strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-2 pl-2 md:pl-3">
                <div style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: 'var(--color-primary)', color: 'var(--color-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 14
                }} data-testid="topbar-avatar">
                  {initials}
                </div>
              </div>
            </div>
          </div>
          {subtitle && (
            <div className="mt-2 text-[13.5px]" style={{ color: 'var(--color-ink-muted)' }}>{subtitle}</div>
          )}
        </header>

        <div className="p-5 md:p-8 lg:p-10 max-w-[1240px] w-full mx-auto flex-1 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
