'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';

const Sidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '🏠',
      href: '/student-desk/dashboard',
      active: router.pathname === '/student-desk/dashboard'
    },
    {
      title: 'Study Notes',
      icon: '📝',
      href: '/student-desk/notes',
      active: router.pathname === '/student-desk/notes'
    },
    {
      title: 'Mock Tests',
      icon: '📋',
      href: '/student-desk/mock-tests',
      active: router.pathname === '/student-desk/mock-tests'
    },
    {
      title: 'PYQ Practice',
      icon: '📊',
      href: '/student-desk/pyq',
      active: router.pathname === '/student-desk/pyq'
    },
    {
      title: 'SSB Practice',
      icon: '🎯',
      href: '/student-desk/ssb-practice',
      active: router.pathname === '/student-desk/ssb-practice'
    },
    {
      title: 'Profile',
      icon: '👤',
      href: '/student-desk/profile',
      active: router.pathname === '/student-desk/profile'
    }
  ];

  return (
    <div className="sidebar bg-white shadow-sm" style={{
      width: '280px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <img
            src="/enlift-hub-logo.jpeg"
            alt="Enlift Hub Logo"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              borderRadius: '6px'
            }}
          />
          <div>
            <h6 className="mb-0 fw-bold" style={{ color: '#2d3748' }}>Enlift Hub</h6>
            <small className="text-muted">UPSC Preparation</small>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-3 border-bottom bg-light">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                 style={{ width: '32px', height: '32px', color: 'white', fontSize: '0.8rem' }}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="small fw-semibold text-truncate" style={{ color: '#2d3748' }}>
                {user.name || user.displayName || user.email?.split('@')[0] || 'Defense Aspirant'}
              </div>
              <div className="small text-muted text-truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="p-2">
        <ul className="list-unstyled">
          {menuItems.map((item, index) => (
            <li key={index} className="mb-1">
              <Link
                href={item.href}
                className={`d-flex align-items-center gap-3 px-3 py-2 rounded text-decoration-none ${
                  item.active
                    ? 'bg-primary text-white'
                    : 'text-dark hover-bg-light'
                }`}
                style={{
                  transition: 'all 0.2s ease',
                  borderRadius: '8px'
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span className="fw-medium">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-top mt-auto">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          style={{ borderRadius: '8px' }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;