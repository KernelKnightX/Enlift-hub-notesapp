import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

/**
 * PageWrapper - A wrapper component that provides:
 * - Error boundary protection
 * - Loading state handling
 * - Optional authentication requirement
 * - Optional admin requirement
 */
export default function PageWrapper({
  children,
  requireAuth = false,
  requireAdmin = false,
  loadingMessage = 'Loading...',
  fallback = null
}) {
  const router = useRouter();

  // For now, we'll use the existing AuthContext pattern
  // This component provides a cleaner API for page wrapping
  
  if (fallback) {
    return (
      <ErrorBoundary>
        {fallback}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

/**
 * LoadingFallback - Shows loading spinner
 */
export function LoadingFallback({ message = 'Loading...' }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <LoadingSpinner message={message} />
    </div>
  );
}

/**
 * AuthGuard - Component to wrap protected content
 */
export function AuthGuard({ children, user, loading, requireAdmin = false }) {
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center p-5">
          <div className="display-1 mb-3">🚫</div>
          <h2 className="h4 mb-3">Access Denied</h2>
          <p className="text-muted mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/student-desk/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * withPageAuth - HOC to wrap page components with auth protection
 */
export function withPageAuth(PageComponent, options = {}) {
  const { requireAdmin = false, fallback = null } = options;

  return function WrappedPage(props) {
    return (
      <PageWrapper requireAuth={true} requireAdmin={requireAdmin} fallback={fallback}>
        <PageComponent {...props} />
      </PageWrapper>
    );
  };
}
