import React, { useState, useCallback } from "react";

export default function EmailLogin({ onLogin, onSwitchToSignup }) {
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
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, validateEmail, onLogin]);

  return (
    <div style={React.useMemo(() => ({
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
    }), [])}>
      <div style={React.useMemo(() => ({
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        padding: '40px'
      }), [])}>
        {/* Header */}
        <div style={React.useMemo(() => ({ textAlign: 'center', marginBottom: '32px' }), [])}>
          <h1 style={React.useMemo(() => ({
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 8px 0'
          }), [])}>
            Welcome Back
          </h1>
          <p style={React.useMemo(() => ({
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }), [])}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={React.useMemo(() => ({
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#991b1b',
            fontSize: '14px'
          }), [])}>
            {error}
          </div>
        )}

        {/* Email Field */}
        <div style={React.useMemo(() => ({ marginBottom: '20px' }), [])}>
          <label style={React.useMemo(() => ({
            display: 'block',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px',
            fontSize: '14px'
          }), [])}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            disabled={loading}
            style={React.useMemo(() => ({
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              transition: 'border-color 0.2s',
              background: 'white',
              boxSizing: 'border-box',
              outline: 'none'
            }), [])}
            onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
            onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
          />
        </div>

        {/* Password Field */}
        <div style={React.useMemo(() => ({ marginBottom: '24px' }), [])}>
          <div style={React.useMemo(() => ({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }), [])}>
            <label style={React.useMemo(() => ({
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }), [])}>
              Password
            </label>
            <a href="#" style={React.useMemo(() => ({
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '500'
            }), [])}>
              Forgot?
            </a>
          </div>
          <div style={React.useMemo(() => ({ position: 'relative' }), [])}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={loading}
              style={React.useMemo(() => ({
                width: '100%',
                padding: '10px 40px 10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
                background: 'white',
                boxSizing: 'border-box',
                outline: 'none'
              }), [])}
              onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
              onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
            />
            <button
              type="button"
              onClick={React.useCallback(() => setShowPassword(!showPassword), [showPassword])}
              style={React.useMemo(() => ({
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
              }), [])}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.email || !formData.password}
          style={React.useMemo(() => ({
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
          }), [loading, formData.email, formData.password])}
          onMouseEnter={React.useCallback((e) => {
            if (!loading && formData.email && formData.password) {
              e.target.style.background = '#2563eb';
            }
          }, [loading, formData.email, formData.password])}
          onMouseLeave={React.useCallback((e) => {
            if (!loading && formData.email && formData.password) {
              e.target.style.background = '#3b82f6';
            }
          }, [loading, formData.email, formData.password])}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Divider */}
        <div style={React.useMemo(() => ({
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          gap: '12px'
        }), [])}>
          <div style={React.useMemo(() => ({ flex: 1, height: '1px', background: '#e5e7eb' }), [])} />
          <span style={React.useMemo(() => ({ color: '#9ca3af', fontSize: '12px' }), [])}>OR</span>
          <div style={React.useMemo(() => ({ flex: 1, height: '1px', background: '#e5e7eb' }), [])} />
        </div>

        {/* Sign Up Link */}
        <div style={React.useMemo(() => ({ textAlign: 'center', fontSize: '14px', color: '#6b7280' }), [])}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            style={React.useMemo(() => ({
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontWeight: '500',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }), [])}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}