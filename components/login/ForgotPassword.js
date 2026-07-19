import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgotPassword({ onBackToLogin }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    if (error) setError("");
  }, [error]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setEmailSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, validateEmail, forgotPassword]);

  // Memoized styles
  const containerStyle = useMemo(() => ({
    minHeight: '100vh',
    width: '100%',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }), []);

  const cardStyle = useMemo(() => ({
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    padding: '40px'
  }), []);

  const headerStyle = useMemo(() => ({ textAlign: 'center', marginBottom: '32px' }), []);

  const titleStyle = useMemo(() => ({
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  }), []);

  const subtitleStyle = useMemo(() => ({
    fontSize: '14px',
    color: '#6b7280',
    margin: 0
  }), []);

  const successStyle = useMemo(() => ({
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    color: '#065f46',
    fontSize: '14px',
    textAlign: 'center'
  }), []);

  const errorStyle = useMemo(() => ({
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '24px',
    color: '#991b1b',
    fontSize: '14px'
  }), []);

  const fieldContainerStyle = useMemo(() => ({ marginBottom: '20px' }), []);

  const labelStyle = useMemo(() => ({
    display: 'block',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
    fontSize: '14px'
  }), []);

  const inputStyle = useMemo(() => ({
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    background: 'white',
    boxSizing: 'border-box',
    outline: 'none'
  }), []);

  const buttonStyle = useMemo(() => ({
    width: '100%',
    padding: '10px',
    background: loading ? '#9ca3af' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit'
  }), [loading]);

  const linkButtonStyle = useMemo(() => ({
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit'
  }), []);

  const backTextStyle = useMemo(() => ({ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '16px' }), []);

  const handleInputFocus = useCallback((e) => {
    e.target.style.borderColor = '#3b82f6';
  }, []);

  const handleInputBlur = useCallback((e) => {
    e.target.style.borderColor = '#d1d5db';
  }, []);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            {emailSent ? 'Check Your Email' : 'Forgot Password'}
          </h1>
          <p style={subtitleStyle}>
            {emailSent 
              ? 'Password reset link has been sent' 
              : 'Enter your email to reset your password'
            }
          </p>
        </div>

        {/* Success Message */}
        {emailSent && (
          <div style={successStyle}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
            <p style={{ margin: 0 }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {!emailSent && (
          <>
            {/* Email Input */}
            <form onSubmit={handleSubmit}>
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !validateEmail(email)}
                style={buttonStyle}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Back to Login */}
            <div style={backTextStyle}>
              Remember your password?{' '}
              <button
                type="button"
                onClick={onBackToLogin}
                style={linkButtonStyle}
              >
                Sign in
              </button>
            </div>
          </>
        )}

        {emailSent && (
          <div style={backTextStyle}>
            Didn't receive the email?{' '}
            <button
              type="button"
              onClick={() => { setEmailSent(false); setEmail(""); }}
              style={linkButtonStyle}
            >
              Try again
            </button>
            <br /><br />
            or{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              style={linkButtonStyle}
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
