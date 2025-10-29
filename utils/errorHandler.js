export const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);

  // Don't expose internal errors to users
  if (error.code === 'permission-denied') {
    return 'You do not have permission to perform this action.';
  }

  if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please try again later.';
  }

  if (error.code === 'not-found') {
    return 'The requested resource was not found.';
  }

  if (error.code === 'already-exists') {
    return 'This item already exists.';
  }

  if (error.code === 'failed-precondition') {
    return 'Operation cannot be completed at this time.';
  }

  // Network errors
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
};

export const logError = (error, context, userId = null) => {
  const errorData = {
    message: error.message,
    code: error.code,
    context,
    userId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    stack: error.stack
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Logged Error:', errorData);
  } else {
    // In production, send to error monitoring service
    // TODO: Send to Sentry, LogRocket, etc.
    console.error('Production error logged:', {
      message: error.message,
      context,
      timestamp: errorData.timestamp
    });
  }
};

export const handleAuthError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'Authentication failed. Please try again.';
  }
};