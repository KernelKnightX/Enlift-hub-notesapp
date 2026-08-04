import '../styles/globals.css';

import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import GoogleAnalytics from '../components/common/GoogleAnalytics';
import NavBar from '../components/common/NavBar';

function App({ Component, pageProps }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isAdminRoute = router.pathname.startsWith('/admin');
  const isStudentRoute = router.pathname.startsWith('/student-desk');

  useEffect(() => setMounted(true), []);
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
          {mounted && !isAdminRoute && !isStudentRoute && router.pathname !== '/' && <NavBar />}
          <Component {...pageProps} />
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
