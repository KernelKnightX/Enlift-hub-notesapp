'use client';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/globals.css';       // changed from '@styles/globals.css'
import '../styles/animations.css';    // changed from '@styles/animations.css'
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast"; // ✅ Import Toaster
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from '../components/ErrorBoundary';

// Wrapper component that provides auth context
const AuthGateWrapper = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.bootstrap) {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      [...tooltipTriggerList].forEach((tooltipTriggerEl) => {
        new window.bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      {/* ✅ Global Toasts */}
      <Toaster position="top-right" reverseOrder={false} />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <AuthGateWrapper Component={Component} pageProps={pageProps} />
    </ErrorBoundary>
  );
}

export default App;
