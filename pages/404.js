// pages/404.js
// Custom 404 error page - shown when page not found

import Link from 'next/link';
import { useEffect } from 'react';

export default function Custom404() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: '404 Page',
        page_location: window.location.href,
      });
    }
  }, []);

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  const contentStyle = {
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '600px',
  };

  const numberStyle = {
    fontSize: '150px',
    fontWeight: '900',
    color: 'rgba(255,255,255,0.1)',
    lineHeight: '1',
    marginBottom: '-20px',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '1rem',
  };

  const descStyle = {
    fontSize: '1.125rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '2rem',
    lineHeight: '1.6',
  };

  const buttonPrimaryStyle = {
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
  };

  const buttonSecondaryStyle = {
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    padding: '14px 32px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={numberStyle}>404</div>
        <h1 style={titleStyle}>Page Not Found</h1>
        <p style={descStyle}>
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />Let&apos;s get you back on track.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={buttonPrimaryStyle}>
            🏠 Go Home
          </Link>
          <Link href="/login" style={buttonSecondaryStyle}>
            🔐 Login
          </Link>
        </div>
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Popular pages:
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/student-desk/dashboard" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem' }}>Dashboard</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <Link href="/student-desk/notes" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem' }}>Notes</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <Link href="/student-desk/mock-tests" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem' }}>Mock Tests</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <Link href="/student-desk/current-affairs" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.875rem' }}>Current Affairs</Link>
          </div>
        </div>
        <p style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
          Found a broken link? <a href="mailto:support@notescafe.in" style={{ color: '#60a5fa', textDecoration: 'none' }}>Report it</a>
        </p>
      </div>
    </div>
  );
}
