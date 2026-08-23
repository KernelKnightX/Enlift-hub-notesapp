import Link from 'next/link';
import { useEffect } from 'react';
import SeoHead from '@/components/seo/SeoHead';

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

  return (
    <>
      <SeoHead
        title="Page not found | Notes Cafe"
        description="This Notes Cafe page does not exist. Browse UPSC study material, maps, government resources and planning tools."
        path="/404"
        noindex
      />
      <div style={containerStyle}>
        <div style={contentStyle}>
          <div
            style={{
              fontSize: '150px',
              fontWeight: '900',
              color: 'rgba(255,255,255,0.1)',
              lineHeight: '1',
              marginBottom: '-20px',
            }}
          >
            404
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
            Page Not Found
          </h1>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}
          >
            This page does not exist or has been moved. Continue with your UPSC prep from the public resources.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
              }}
            >
              Go Home
            </Link>
            <Link
              href="/study-material"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              Study Material
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
