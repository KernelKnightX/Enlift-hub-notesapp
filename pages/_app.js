import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/globals.css';
import '../styles/animations.css';
import '../styles/common.css';
import '../styles/sidebar.css';

import { AuthProvider } from "../contexts/AuthContext";
import ErrorBoundary from '../components/ErrorBoundary';
import GoogleAnalytics from '../components/GoogleAnalytics';

function App({ Component, pageProps }) {
  return (
    <>
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
