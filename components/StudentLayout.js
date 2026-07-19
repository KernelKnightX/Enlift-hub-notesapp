/**
 * StudentLayout - Shared layout component for all student desk pages
 * Provides consistent sidebar, header, and navigation across all pages
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '⌂', href: '/student-desk/dashboard' },
  { label: 'Current Affairs', icon: '◈', href: '/student-desk/current-affairs' },
  { label: 'PYQ Papers', icon: '◎', href: '/student-desk/pyq' },
  { label: 'Mock Tests', icon: '◷', href: '/student-desk/mock-tests' },
  { label: 'Study Notes', icon: '✎', href: '/student-desk/notes' },
  { label: 'Syllabus', icon: '≡', href: '/student-desk/syllabus' },
  { label: 'Planner', icon: '⊞', href: '/student-desk/planner' },
  { label: 'Profile', icon: '👤', href: '/student-desk/profile' },
];

export default function StudentLayout({ children, title = 'Student Desk' }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  // Auth guard
  useEffect(() => {
    if (!user && router.pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`sidebar-container ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">UPSC<br/>Student Desk</div>
          <div className="sidebar-logo-sub">Beta · 2026 Batch</div>
        </div>
        <div className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              className={`sidebar-nav-item ${router.pathname === item.href ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <span>⎋</span> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button 
              className="topbar-hamburger"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <div className="topbar-greeting">{getGreeting()}</div>
              <div className="topbar-date">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-avatar">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );
}
