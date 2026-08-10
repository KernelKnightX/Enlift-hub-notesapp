// components/GoogleAnalytics.js
// Google Analytics tracking component
// To use: Add your GA_MEASUREMENT_ID to .env.local and import in _app.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }) {
  const router = useRouter();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: router.pathname,
    });

    // Cleanup on unmount
    return () => {
      try {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (e) {
        // Ignore if DOM elements are already gone or inaccessible
        // (defensive guard against rare hydration/unmount races)
      }
    };
  }, [GA_MEASUREMENT_ID, router.pathname]);

  // Track page views on route change
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, GA_MEASUREMENT_ID]);

  return null;
}

// Usage in _app.js:
// import GoogleAnalytics from '../components/GoogleAnalytics';
//
// function MyApp({ Component, pageProps }) {
//   return (
//     <>
//       <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
//       <Component {...pageProps} />
//     </>
//   );
// }
