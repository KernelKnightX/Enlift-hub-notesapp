import '../styles/globals.css';

import Head from 'next/head';
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import GoogleAnalytics from '@/components/common/GoogleAnalytics';
import DefaultSeo from '@/components/seo/DefaultSeo';
import PublicNavbar from '@/components/public/layout/PublicNavbar';
import NoticeTicker from '@/components/common/NoticeTicker';
import LandingFooter from '@/components/landing/LandingFooter';
import "../styles/ncert-books.css";
import "../styles/admin-ncert.css";
import "../styles/maps/map-detail.css";
import "../styles/maps/maps-upsc.css";
import "../styles/resource-hero.css";
import "../styles/planning-tools/upsc-calendar.css";
import "../styles/planning-tools/planning-interactive.css";
import "../styles/monthly-magazines.css";
import "../styles/notes-editor.css";
import "../styles/current-affairs.css";
import "../styles/pyq-desk.css";
import "../styles/profile-desk.css";
import "../styles/dashboard-desk.css";
import "../styles/planner-desk.css";
import "../styles/student-topbar.css";
import "../styles/landing-hero-showcase.css";
import "../styles/landing-below-hero.css";
import "../styles/about-page.css";
import "../styles/404-page.css";
import "../styles/public-current-affairs.css";
import "../styles/mock-test-desk.css";
function App({ Component, pageProps }) {
  const router = useRouter();
  const isStudentRoute = router.pathname.startsWith('/student-desk');
  const isAdminRoute = router.pathname.startsWith('/admin');
  const showPublicChrome = !isStudentRoute && !isAdminRoute;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#0F0F14" />
      </Head>
      <DefaultSeo />
      <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      <ErrorBoundary>
        <AuthProvider>
          {/* Show PublicNavbar + moving notifications on all routes except student-desk pages */}
          {showPublicChrome && (
            <div className="sticky top-0 z-50" style={{ background: 'var(--color-ink)' }}>
              <PublicNavbar showOnLanding />
              <NoticeTicker />
            </div>
          )}

          <Component {...pageProps} />

          {/* Footer on all pages except student-desk */}
          {showPublicChrome && <LandingFooter />}
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
