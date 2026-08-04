import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

export default function PhoneLogin({ onLogin, onSwitchToEmail, onSwitchToSignup }) {
  const { sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState(null);
  const recaptchaContainerRef = useRef(null);

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    if (typeof window !== 'undefined' && recaptchaContainerRef.current) {
      try {
        const auth = getAuth();
        
        // Clear any existing reCAPTCHA
        recaptchaContainerRef.current.innerHTML = '';
        
        // Create new reCAPTCHA verifier
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response) => {
            // reCAPTCHA solved
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            // reCAPTCHA expired
            setError('Verification expired. Please try again.');
          }
        });
      } catch (err) {
        console.error('Error initializing reCAPTCHA:', err);
      }
    }
  }, []);

  const validatePhone = useCallback((number) => {
    const cleanNumber = number.replace(/\D/g, "");
    return cleanNumber.length === 10;
  }, []);

  const handlePhoneChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
      if (error) setError("");
    }
  }, [error]);

  const handleOtpChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
      if (error) setError("");
    }
  }, [error]);

  const handleSendOtp = useCallback(async () => {
    if (!validatePhone(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Format phone with country code
      const formattedPhone = '+91' + phone;
      
      // Check if recaptchaVerifier exists
      if (!window.recaptchaVerifier) {
        const auth = getAuth();
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
      
      // Send OTP
      const vid = await sendPhoneOtp(formattedPhone);
      setVerificationId(vid);
      setOtpSent(true);
      
      // Start countdown
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [phone, validatePhone, sendPhoneOtp]);

  const handleVerifyOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await verifyPhoneOtp(otp);
      // User will be redirected automatically due to auth state change
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [otp, verifyPhoneOtp]);

  const handleResendOtp = useCallback(async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  }, [countdown, handleSendOtp]);

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

  const resendStyle = useMemo(() => ({
    color: countdown > 0 ? '#9ca3af' : '#3b82f6',
    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    background: 'none',
    border: 'none',
    marginTop: '8px'
  }), [countdown]);

  const dividerContainerStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
    gap: '12px'
  }), []);

  const dividerLineStyle = useMemo(() => ({ flex: 1, height: '1px', background: '#e5e7eb' }), []);

  const dividerTextStyle = useMemo(() => ({ color: '#9ca3af', fontSize: '12px' }), []);

  const signupTextStyle = useMemo(() => ({ textAlign: 'center', fontSize: '14px', color: '#6b7280' }), []);

  const switchTextStyle = useMemo(() => ({ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '16px' }), []);

  const handleInputFocus = useCallback((e) => {
    e.target.style.borderColor = '#3b82f6';
  }, []);

  const handleInputBlur = useCallback((e) => {
    e.target.style.borderColor = '#d1d5db';
  }, []);

  const formatPhoneDisplay = (number) => {
    if (number.length <= 5) return number;
    return `${number.slice(0, 5)} ${number.slice(5)}`;
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Hidden reCAPTCHA container */}
        <div id="recaptcha-container" ref={recaptchaContainerRef} style={{ display: 'none' }}></div>

        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            {otpSent ? 'Enter OTP' : 'Login with Phone'}
          </h1>
          <p style={subtitleStyle}>
            {otpSent 
              ? `We sent a code to +91 ${formatPhoneDisplay(phone)}` 
              : 'Enter your mobile number to login'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        {!otpSent ? (
          <>
            {/* Phone Number Input */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>
                Mobile Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  padding: '10px 12px', 
                  border: '1px solid #d1d5db', 
                  borderRight: 'none',
                  borderRadius: '6px 0 0 6px',
                  background: '#f9fafb',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  +91
                </span>
                <input
                  type="tel"
                  value={formatPhoneDisplay(phone)}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  disabled={loading}
                  style={{...inputStyle, borderRadius: '0 6px 6px 0', paddingLeft: '8px'}}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* Send OTP Button */}
            <button
              onClick={handleSendOtp}
              disabled={loading || !validatePhone(phone)}
              style={buttonStyle}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            {/* OTP Input */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>
                One-Time Password (OTP)
              </label>
              <input
                type="tel"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                disabled={loading}
                style={{...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '18px'}}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                autoFocus
              />
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  style={resendStyle}
                >
                  {countdown > 0 
                    ? `Resend OTP in ${countdown}s` 
                    : 'Resend OTP'
                  }
                </button>
              </div>
            </div>

            {/* Verify OTP Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              style={buttonStyle}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            {/* Change Phone Number */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(""); setCountdown(0); }}
                style={linkButtonStyle}
              >
                Change phone number
              </button>
            </div>
          </>
        )}

        {/* Divider */}
        <div style={dividerContainerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>OR</span>
          <div style={dividerLineStyle} />
        </div>

        {/* Switch to Email Login */}
        <div style={switchTextStyle}>
          <button
            type="button"
            onClick={onSwitchToEmail}
            style={linkButtonStyle}
          >
            Login with Email & Password
          </button>
        </div>

        {/* Sign Up Link */}
        <div style={signupTextStyle}>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            style={linkButtonStyle}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
