import React, { useState, useCallback, useMemo } from "react";

export default function EmailLogin({ onLogin, onSwitchToSignup, onSwitchToPhone, onForgotPassword }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  }, [error]);

  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await onLogin(formData);
    } catch (err) {
      // Use the error message from AuthContext if available
      const errorMessage = err.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, validateEmail, onLogin]);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Memoized styles at top level
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

  const passwordFieldContainerStyle = useMemo(() => ({ marginBottom: '24px' }), []);

  const passwordLabelRowStyle = useMemo(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  }), []);

  const forgotLinkStyle = useMemo(() => ({
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500'
  }), []);

  const passwordInputWrapperStyle = useMemo(() => ({ position: 'relative' }), []);

  const passwordToggleStyle = useMemo(() => ({
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
    padding: '4px'
  }), []);

  const buttonStyle = useMemo(() => ({
    width: '100%',
    padding: '10px',
    background: loading || !formData.email || !formData.password ? '#9ca3af' : '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: loading || !formData.email || !formData.password ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
    fontFamily: 'inherit'
  }), [loading, formData.email, formData.password]);

  const dividerContainerStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    gap: '12px'
  }), []);

  const dividerLineStyle = useMemo(() => ({ flex: 1, height: '1px', background: '#e5e7eb' }), []);

  const dividerTextStyle = useMemo(() => ({ color: '#9ca3af', fontSize: '12px' }), []);

  const signupTextStyle = useMemo(() => ({ textAlign: 'center', fontSize: '14px', color: '#6b7280' }), []);

  const signupButtonStyle = useMemo(() => ({
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit'
  }), []);

  const handleInputFocus = useCallback((e) => {
    e.target.style.borderColor = '#3b82f6';
  }, []);

  const handleInputBlur = useCallback((e) => {
    e.target.style.borderColor = '#d1d5db';
  }, []);

  const handleButtonMouseEnter = useCallback((e) => {
    if (!loading && formData.email && formData.password) {
      e.target.style.background = '#2563eb';
    }
  }, [loading, formData.email, formData.password]);

  const handleButtonMouseLeave = useCallback((e) => {
    if (!loading && formData.email && formData.password) {
      e.target.style.background = '#3b82f6';
    }
  }, [loading, formData.email, formData.password]);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            Welcome Back
          </h1>
          <p style={subtitleStyle}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {/* Email Field */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            disabled={loading}
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Password Field */}
        <div style={passwordFieldContainerStyle}>
          <div style={passwordLabelRowStyle}>
            <label style={labelStyle}>
              Password
            </label>
            <button 
              type="button"
              onClick={onForgotPassword}
              style={forgotLinkStyle}
            >
              Forgot Password?
            </button>
          </div>
          <div style={passwordInputWrapperStyle}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={loading}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <button
              type="button"
              onClick={togglePassword}
              style={passwordToggleStyle}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.email || !formData.password}
          style={buttonStyle}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Divider */}
        <div style={dividerContainerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>OR</span>
          <div style={dividerLineStyle} />
        </div>

        {/* Login with Phone */}
        <button
          type="button"
          onClick={onSwitchToPhone}
          style={signupButtonStyle}
        >
          📱 Login with Phone (OTP)
        </button>

        {/* Sign Up Link */}
        <div style={signupTextStyle}>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            style={signupButtonStyle}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
