import { useState } from "react";

export default function PhoneInput({ onSubmit, sending }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const validatePhone = (number) => {
    const cleanNumber = number.replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }
    if (cleanNumber.length > 10) {
      setError("Mobile number should not exceed 10 digits");
      return false;
    }
    setError("");
    return true;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
      if (error) setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validatePhone(phone)) {
      onSubmit(phone);
    }
  };

  const formatDisplayPhone = (number) => {
    if (number.length <= 5) return number;
    return `${number.slice(0, 5)} ${number.slice(5)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
      {/* Country Code */}
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark small">Country</label>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 px-3">
            <span className="me-2">🇮🇳</span>
            <span className="text-muted">India (+91)</span>
          </span>
        </div>
      </div>

      {/* Mobile Number */}
      <div className="mb-4">
        <label className="form-label fw-semibold text-dark small">
          Registered Mobile Number
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <span style={{ fontSize: '1.1rem' }}>📱</span>
          </span>
          <input
            type="tel"
            className={`form-control form-control-lg border-start-0 ${
              error ? 'is-invalid' : phone.length === 10 ? 'is-valid' : ''
            }`}
            placeholder="Enter registered mobile"
            value={formatDisplayPhone(phone)}
            onChange={handlePhoneChange}
            disabled={sending}
            style={{ 
              fontSize: '1.1rem',
              letterSpacing: '1px',
              paddingLeft: '0.5rem'
            }}
          />
          {error && <div className="invalid-feedback">{error}</div>}
        </div>
        <small className="text-muted mt-1 d-block">
          {sending 
            ? "🔍 Checking registration status..." 
            : "We'll verify if this number is registered with Notes Cafe"
          }
        </small>
      </div>

      {/* Example */}
      <div className="mb-4 p-3 bg-light rounded border">
        <small className="text-muted">
          <strong>Example:</strong> 9876543210
          <br />
          <span className="text-info">
            ℹ️ Only registered numbers can receive OTP
          </span>
        </small>
      </div>

      {/* Check Registration Button */}
      <button
        type="submit"
        className="btn btn-success btn-lg w-100 fw-semibold"
        disabled={sending || phone.length !== 10}
        style={{ 
          background: sending 
            ? 'linear-gradient(135deg, #6c757d 0%, #adb5bd 100%)' 
            : 'linear-gradient(135deg, #198754 0%, #20c997 100%)',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(25, 135, 84, 0.3)',
          padding: '12px',
          transition: 'all 0.3s ease'
        }}
      >
        {sending ? (
          <>
            <span className="spinner-border spinner-border-sm me-2">
              <span className="visually-hidden">Loading...</span>
            </span>
            Checking Registration...
          </>
        ) : (
          '🔍 Verify & Send OTP'
        )}
      </button>

      {/* Trust Indicators */}
      <div className="mt-4">
        <div className="d-flex justify-content-between text-center">
          <div className="flex-fill">
            <div className="text-success small fw-semibold">✅ Verified</div>
            <small className="text-muted">Registered Only</small>
          </div>
          <div className="flex-fill border-start border-end">
            <div className="text-primary small fw-semibold">⚡ Instant</div>
            <small className="text-muted">Real-time Check</small>
          </div>
          <div className="flex-fill">
            <div className="text-warning small fw-semibold">🛡️ Secure</div>
            <small className="text-muted">OTP Protected</small>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="mt-3 alert alert-success alert-dismissible fade show py-2 border-0">
        <small>
          <strong>💡 Note:</strong> If your number isn't registered with Notes Cafe, you'll be redirected to create an account.
        </small>
      </div>
    </form>
  );
}