'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';

const Sidebar = ({ open, onClose, onLogout: propLogout }) => {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (open !== undefined) {
      setIsMobileOpen(open);
    }
  }, [open]);

  const handleLogout = async () => {
    try {
      if (propLogout) {
        await propLogout();
      } else {
        await authLogout();
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
    if (onClose) onClose();
  };

  const menuItems = [
    { label: 'Dashboard', icon: '⌂', href: '/student-desk/dashboard', active: router.pathname === '/student-desk/dashboard' },
    { label: 'Current Affairs', icon: '◈', href: '/student-desk/current-affairs', active: router.pathname === '/student-desk/current-affairs' },
    { label: 'PYQ Papers', icon: '◎', href: '/student-desk/pyq', active: router.pathname === '/student-desk/pyq' },
    { label: 'Mock Tests', icon: '◷', href: '/student-desk/mock-tests', active: router.pathname === '/student-desk/mock-tests' },
    { label: 'Study Notes', icon: '✎', href: '/student-desk/notes', active: router.pathname === '/student-desk/notes' },
    { label: 'Syllabus', icon: '≡', href: '/student-desk/syllabus', active: router.pathname === '/student-desk/syllabus' },
    { label: 'Planner', icon: '⊞', href: '/student-desk/planner', active: router.pathname === '/student-desk/planner' },
    { label: 'Profile', icon: '👤', href: '/student-desk/profile', active: router.pathname === '/student-desk/profile' }
  ];

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'open' : ''}`}
        onClick={closeMobileSidebar}
      />

      {/* Sidebar */}
      <nav className={`sidebar-container ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">UPSC<br/>Student Desk</div>
          <div className="sidebar-logo-sub">Beta · 2026 Batch</div>
        </div>
        <div className="sidebar-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`sidebar-nav-item ${item.active ? 'active' : ''}`}
              onClick={() => {
                setIsMobileOpen(false);
                if (onClose) onClose();
              }}
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
    </>
  );
};

export default Sidebar;
