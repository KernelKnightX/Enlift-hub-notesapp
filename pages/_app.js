import '../styles/globals.css';

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import GoogleAnalytics from '@/components/common/GoogleAnalytics';
import PublicNavbar from '@/components/public/layout/PublicNavbar';
import NoticeTicker from '@/components/common/NoticeTicker';
import LandingFooter from '@/components/landing/LandingFooter';
import "./study-material/ncert-books.css";
import "./admin/books/admin-ncert.css";
function App({ Component, pageProps }) {
  const router = useRouter();
  const isStudentRoute = router.pathname.startsWith('/student-desk');

  return (
    <>
      <Head>
        <title>Notes Cafe — The Editorial UPSC Preparation Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Notes Cafe is the premium editorial platform for UPSC aspirants — daily current affairs, PYQs, mock tests, study notes and planner in one calm, focused space." />
        <meta name="theme-color" content="#FDFCF7" />
      </Head>
      <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      <ErrorBoundary>
        <AuthProvider>
          {/* Show PublicNavbar + moving notifications on all routes except student-desk pages */}
          {!isStudentRoute && (
            <div className="sticky top-0 z-50" style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
              <PublicNavbar showOnLanding />
              <NoticeTicker />
            </div>
          )}

          <Component {...pageProps} />

          {/* Footer on all pages except student-desk */}
          {!isStudentRoute && <LandingFooter />}
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
