import React, { useState, useCallback } from "react";

function EmailSignup({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    city: "",
    hasGivenSSB: "",
    ssbAttempts: "",
    preparingForDefence: "",
    examType: "",
    targetYear: ""
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

  const validateForm = useCallback(() => {
    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!formData.dateOfBirth) {
      setError("Please select your date of birth");
      return false;
    }
    if (!formData.city.trim()) {
      setError("Please enter your city");
      return false;
    }
    if (!formData.preparingForDefence) {
      setError("Please select if you're preparing for defence exams");
      return false;
    }
    if (formData.preparingForDefence === "yes" && !formData.examType) {
      setError("Please select which defence exam you're preparing for");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  }, [formData, validateEmail]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSignup(formData);
    } catch (error) {
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSignup]);

  const inputStyle = React.useMemo(() => ({
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

  const labelStyle = React.useMemo(() => ({
    display: 'block',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
    fontSize: '14px'
  }), []);

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
      bottom: 0,
      overflowY: 'auto'
    }), [])}>
      <div style={React.useMemo(() => ({
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
        margin: '20px auto',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto'
      }), [])}>
        {/* Header */}
        <div style={React.useMemo(() => ({ textAlign: 'center', marginBottom: '24px' }), [])}>
          <h1 style={React.useMemo(() => ({
            fontSize: '22px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 6px 0'
          }), [])}>
            Create Account
          </h1>
          <p style={React.useMemo(() => ({
            fontSize: '13px',
            color: '#6b7280',
            margin: 0
          }), [])}>
            Start your Defence preparation journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={React.useMemo(() => ({
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '20px',
            color: '#991b1b',
            fontSize: '13px'
          }), [])}>
            {error}
          </div>
        )}

        {/* Full Name */}
        <div style={React.useMemo(() => ({ marginBottom: '16px' }), [])}>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            disabled={loading}
            style={inputStyle}
            onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
            onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
          />
        </div>

        {/* Email & Phone in Grid */}
        <div style={React.useMemo(() => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }), [])}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              disabled={loading}
              style={inputStyle}
              onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
              onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="9876543210"
              disabled={loading}
              style={inputStyle}
              onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
              onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
            />
          </div>
        </div>

        {/* Date of Birth & City */}
        <div style={React.useMemo(() => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }), [])}>
          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              disabled={loading}
              style={inputStyle}
              onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
              onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
            />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Your city"
              disabled={loading}
              style={inputStyle}
              onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
              onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
            />
          </div>
        </div>

        {/* SSB Experience */}
        <div style={React.useMemo(() => ({ marginBottom: '16px' }), [])}>
          <label style={labelStyle}>Have you given SSB before?</label>
          <div style={React.useMemo(() => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }), [])}>
            {['yes', 'no'].map(option => (
              <label key={option} style={React.useMemo(() => ({
                padding: '10px',
                border: formData.hasGivenSSB === option ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'center',
                background: formData.hasGivenSSB === option ? '#eff6ff' : 'white',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                fontWeight: '500',
                fontSize: '13px'
              }), [formData.hasGivenSSB, option])}>
                <input
                  type="radio"
                  name="hasGivenSSB"
                  value={option}
                  checked={formData.hasGivenSSB === option}
                  onChange={handleInputChange}
                  style={React.useMemo(() => ({ display: 'none' }), [])}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* SSB Attempts - Conditional */}
        {formData.hasGivenSSB === 'yes' && (
          <div style={React.useMemo(() => ({ marginBottom: '16px' }), [])}>
            <label style={labelStyle}>Number of SSB attempts</label>
            <select
              name="ssbAttempts"
              value={formData.ssbAttempts}
              onChange={handleInputChange}
              disabled={loading}
              style={inputStyle}
            >
              <option value="">Select attempts</option>
              <option value="1">1 attempt</option>
              <option value="2">2 attempts</option>
              <option value="3">3 attempts</option>
              <option value="4">4+ attempts</option>
            </select>
          </div>
        )}

        {/* Preparing for Defence */}
        <div style={React.useMemo(() => ({ marginBottom: '16px' }), [])}>
          <label style={labelStyle}>Preparing for defence exam?</label>
          <div style={React.useMemo(() => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }), [])}>
            {['yes', 'no'].map(option => (
              <label key={option} style={React.useMemo(() => ({
                padding: '10px',
                border: formData.preparingForDefence === option ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'center',
                background: formData.preparingForDefence === option ? '#eff6ff' : 'white',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
                fontWeight: '500',
                fontSize: '13px'
              }), [formData.preparingForDefence, option])}>
                <input
                  type="radio"
                  name="preparingForDefence"
                  value={option}
                  checked={formData.preparingForDefence === option}
                  onChange={handleInputChange}
                  style={React.useMemo(() => ({ display: 'none' }), [])}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Exam Type - Conditional */}
        {formData.preparingForDefence === 'yes' && (
          <>
            <div style={React.useMemo(() => ({ marginBottom: '16px' }), [])}>
              <label style={labelStyle}>Which exam?</label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleInputChange}
                disabled={loading}
                style={inputStyle}
              >
                <option value="">Select exam</option>
                <option value="CDS">CDS - Combined Defence Services</option>
                <option value="NDA">NDA - National Defence Academy</option>
                <option value="AFCAT">AFCAT - Air Force Common Admission Test</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {formData.examType && (
              <div style={React.useMemo(() => ({ marginBottom: '16px' }), [])}>
                <label style={labelStyle}>Target Year</label>
                <select
                  name="targetYear"
                  value={formData.targetYear}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={inputStyle}
                >
                  <option value="">Select year</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            )}
          </>
        )}

        {/* Password */}
        <div style={React.useMemo(() => ({ marginBottom: '16px' }), [])}>
          <label style={labelStyle}>Password</label>
          <div style={React.useMemo(() => ({ position: 'relative' }), [])}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="At least 6 characters"
              disabled={loading}
              style={React.useMemo(() => ({...inputStyle, paddingRight: '40px'}), [inputStyle])}
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

        {/* Confirm Password */}
        <div style={React.useMemo(() => ({ marginBottom: '20px' }), [])}>
          <label style={labelStyle}>Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter password"
            disabled={loading}
            style={inputStyle}
            onFocus={React.useCallback((e) => e.target.style.borderColor = '#3b82f6', [])}
            onBlur={React.useCallback((e) => e.target.style.borderColor = '#d1d5db', [])}
          />
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.fullName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.city || !formData.preparingForDefence || (formData.preparingForDefence === 'yes' && !formData.examType) || !formData.password || !formData.confirmPassword}
          style={React.useMemo(() => ({
            width: '100%',
            padding: '10px',
            background: loading || !formData.fullName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.city || !formData.preparingForDefence || (formData.preparingForDefence === 'yes' && !formData.examType) || !formData.password || !formData.confirmPassword ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading || !formData.fullName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.city || !formData.preparingForDefence || (formData.preparingForDefence === 'yes' && !formData.examType) || !formData.password || !formData.confirmPassword ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            fontFamily: 'inherit'
          }), [loading, formData])}
          onMouseEnter={React.useCallback((e) => {
            if (!loading && formData.fullName && formData.email && formData.phoneNumber && formData.dateOfBirth && formData.city && formData.preparingForDefence && (formData.preparingForDefence === 'no' || formData.examType) && formData.password && formData.confirmPassword) {
              e.target.style.background = '#2563eb';
            }
          }, [loading, formData])}
          onMouseLeave={React.useCallback((e) => {
            if (!loading && formData.fullName && formData.email && formData.phoneNumber && formData.dateOfBirth && formData.city && formData.preparingForDefence && (formData.preparingForDefence === 'no' || formData.examType) && formData.password && formData.confirmPassword) {
              e.target.style.background = '#3b82f6';
            }
          }, [loading, formData])}
        >
          {loading ? 'Creating account...' : 'Create account'}
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

        {/* Login Link */}
        <div style={React.useMemo(() => ({ textAlign: 'center', fontSize: '14px', color: '#6b7280' }), [])}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
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
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailSignup;