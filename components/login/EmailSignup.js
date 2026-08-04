import React, { useState, useCallback, useMemo } from "react";

function EmailSignup({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    city: "",
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
    } catch (err) {
      // Use the error message from AuthContext if available
      const errorMessage = err?.message || "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSignup]);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleInputFocus = useCallback((e) => {
    e.target.style.borderColor = '#3b82f6';
  }, []);

  const handleInputBlur = useCallback((e) => {
    e.target.style.borderColor = '#d1d5db';
  }, []);

  // Memoized styles at top level
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

  const labelStyle = useMemo(() => ({
    display: 'block',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
    fontSize: '14px'
  }), []);

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
    bottom: 0,
    overflow: 'auto'
  }), []);

  const cardStyle = useMemo(() => ({
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
    padding: '24px',
    margin: '20px 0'
  }), []);

  const headerStyle = useMemo(() => ({ textAlign: 'center', marginBottom: '24px' }), []);

  const titleStyle = useMemo(() => ({
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 8px 0'
  }), []);

  const subtitleStyle = useMemo(() => ({
    fontSize: '13px',
    color: '#6b7280',
    margin: 0
  }), []);

  const errorStyle = useMemo(() => ({
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: '#991b1b',
    fontSize: '14px'
  }), []);

  const fieldContainerStyle = useMemo(() => ({ marginBottom: '16px' }), []);

  const gridStyle = useMemo(() => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }), []);

  const radioGroupStyle = useMemo(() => ({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }), []);

  const radioLabelStyle = useMemo(() => ({
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  }), []);

  const radioInputStyle = useMemo(() => ({ display: 'none' }), []);

  const passwordWrapperStyle = useMemo(() => ({ position: 'relative' }), []);

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
    padding: '12px',
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

  const dividerContainerStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0',
    gap: '12px'
  }), []);

  const dividerLineStyle = useMemo(() => ({ flex: 1, height: '1px', background: '#e5e7eb' }), []);

  const dividerTextStyle = useMemo(() => ({ color: '#9ca3af', fontSize: '12px' }), []);

  const loginTextStyle = useMemo(() => ({ textAlign: 'center', fontSize: '14px', color: '#6b7280' }), []);

  const loginButtonStyle = useMemo(() => ({
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontWeight: '500',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
    fontSize: 'inherit'
  }), []);

  const handleButtonMouseEnter = useCallback((e) => {
    const isFormValid = formData.fullName && formData.email && formData.phoneNumber && 
      formData.dateOfBirth && formData.city && formData.preparingForDefence && 
      (formData.preparingForDefence === 'no' || formData.examType) && 
      formData.password && formData.confirmPassword;
    if (!loading && isFormValid) {
      e.target.style.background = '#2563eb';
    }
  }, [loading, formData]);

  const handleButtonMouseLeave = useCallback((e) => {
    if (!loading) {
      e.target.style.background = '#3b82f6';
    }
  }, [loading]);

  const isFormValid = formData.fullName && formData.email && formData.phoneNumber && 
    formData.dateOfBirth && formData.city && formData.preparingForDefence && 
    (formData.preparingForDefence === 'no' || formData.examType) && 
    formData.password && formData.confirmPassword;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            Create Account
          </h1>
          <p style={subtitleStyle}>
            Join Notes Cafe for your exam preparation
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {/* Full Name */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            disabled={loading}
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Email & Phone in Grid */}
        <div style={gridStyle}>
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
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Mobile number"
              disabled={loading}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>

        {/* Date of Birth & City */}
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              disabled={loading}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
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
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>

        {/* Preparing for Defence */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Preparing for defence exam?</label>
          <div style={radioGroupStyle}>
            {['yes', 'no'].map(option => (
              <label 
                key={option}
                style={{
                  ...radioLabelStyle,
                  background: formData.preparingForDefence === option ? '#eff6ff' : 'white',
                  borderColor: formData.preparingForDefence === option ? '#3b82f6' : '#d1d5db'
                }}
              >
                <input
                  type="radio"
                  name="preparingForDefence"
                  value={option}
                  checked={formData.preparingForDefence === option}
                  onChange={handleInputChange}
                  disabled={loading}
                  style={radioInputStyle}
                />
                {option === 'yes' ? 'Yes' : 'No'}
              </label>
            ))}
          </div>
        </div>

        {formData.preparingForDefence === 'yes' && (
          <>
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Which exam?</label>
              <div style={radioGroupStyle}>
                {['CDS', 'AFCAT', 'NDA', 'Other'].map(option => (
                  <label 
                    key={option}
                    style={{
                      ...radioLabelStyle,
                      background: formData.examType === option ? '#eff6ff' : 'white',
                      borderColor: formData.examType === option ? '#3b82f6' : '#d1d5db'
                    }}
                  >
                    <input
                      type="radio"
                      name="examType"
                      value={option}
                      checked={formData.examType === option}
                      onChange={handleInputChange}
                      disabled={loading}
                      style={radioInputStyle}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {formData.examType && (
              <div style={fieldContainerStyle}>
                <label style={labelStyle}>Target Year</label>
                <input
                  type="number"
                  name="targetYear"
                  value={formData.targetYear}
                  onChange={handleInputChange}
                  placeholder="e.g., 2025"
                  disabled={loading}
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            )}
          </>
        )}

        {/* Password */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Password</label>
          <div style={passwordWrapperStyle}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Create a password"
              disabled={loading}
              style={{...inputStyle, paddingRight: '40px'}}
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

        {/* Confirm Password */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            disabled={loading}
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          style={buttonStyle}
          onMouseEnter={handleButtonMouseEnter}
          onMouseLeave={handleButtonMouseLeave}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        {/* Divider */}
        <div style={dividerContainerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>OR</span>
          <div style={dividerLineStyle} />
        </div>

        {/* Login Link */}
        <div style={loginTextStyle}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={loginButtonStyle}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailSignup;
