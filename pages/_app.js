import '../styles/globals.css';

import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import GoogleAnalytics from '../components/GoogleAnalytics';

function App({ Component, pageProps }) {
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
          <Component {...pageProps} />
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
