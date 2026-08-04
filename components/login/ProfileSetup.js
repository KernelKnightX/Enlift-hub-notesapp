import { useState } from "react";

export default function ProfileSetup({ userEmail, onComplete }) {
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    city: "",
    preparingForDefence: "",
    examType: "",
    targetYear: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return formData.fullName && 
           formData.dateOfBirth && 
           formData.city && 
           formData.preparingForDefence;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.preparingForDefence === "yes" && !formData.examType) {
      alert("Please select which defence exam you're preparing for");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Save profile data to Firebase/Database
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Profile saved successfully
      
      alert("Profile setup completed! Redirecting to dashboard...");
      
      // Call the onComplete callback
      onComplete();
      
    } catch (error) {
      console.error("Profile setup error:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a365d 0%, #2d5a87 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '600px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2d5a87 100%)',
          padding: '40px 30px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎖️</div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            margin: '0 0 8px 0'
          }}>
            Complete Your Profile
          </h1>
          <p style={{ 
            fontSize: '15px', 
            opacity: 0.9,
            margin: 0 
          }}>
            Just a few details to get you started
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '40px 35px' }}>
          {/* User Email Display */}
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #bfdbfe',
            borderRadius: '10px',
            padding: '12px 15px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>📧</span>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Email Address
              </div>
              <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                {userEmail || 'user@example.com'}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                background: 'white',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Date of Birth and City */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Date of Birth <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  background: 'white',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                City <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Your city"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  background: 'white',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Preparing for Defence */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Are you preparing for any Defence Exam? <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '15px' }}>
              <label style={{
                flex: 1,
                padding: '15px',
                border: formData.preparingForDefence === 'yes' 
                  ? '3px solid #10b981' 
                  : '2px solid #e5e7eb',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: formData.preparingForDefence === 'yes' ? '#f0fdf4' : 'white',
                textAlign: 'center'
              }}>
                <input
                  type="radio"
                  name="preparingForDefence"
                  value="yes"
                  checked={formData.preparingForDefence === 'yes'}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>✅</div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>Yes</div>
              </label>
              <label style={{
                flex: 1,
                padding: '15px',
                border: formData.preparingForDefence === 'no' 
                  ? '3px solid #ef4444' 
                  : '2px solid #e5e7eb',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: formData.preparingForDefence === 'no' ? '#fef2f2' : 'white',
                textAlign: 'center'
              }}>
                <input
                  type="radio"
                  name="preparingForDefence"
                  value="no"
                  checked={formData.preparingForDefence === 'no'}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                />
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>❌</div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>No</div>
              </label>
            </div>
          </div>

          {/* Conditional Exam Selection */}
          {formData.preparingForDefence === 'yes' && (
            <div style={{
              background: '#f0f9ff',
              border: '2px solid #bfdbfe',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              animation: 'slideDown 0.3s ease'
            }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                fontSize: '14px'
              }}>
                Which Defence Exam? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {['CDS', 'NDA', 'AFCAT', 'Other'].map((exam) => (
                  <label key={exam} style={{
                    padding: '14px 16px',
                    border: formData.examType === exam 
                      ? '3px solid #3b82f6' 
                      : '2px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: formData.examType === exam ? '#eff6ff' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <input
                      type="radio"
                      name="examType"
                      value={exam}
                      checked={formData.examType === exam}
                      onChange={handleInputChange}
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ 
                      fontSize: '20px',
                      filter: formData.examType === exam ? 'none' : 'grayscale(100%)'
                    }}>
                      {exam === 'CDS' ? '🎖️' : exam === 'NDA' ? '⚔️' : exam === 'AFCAT' ? '✈️' : '📋'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: formData.examType === exam ? '#1e293b' : '#475569',
                        fontSize: '15px'
                      }}>
                        {exam}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        marginTop: '2px'
                      }}>
                        {exam === 'CDS' && 'Combined Defence Services'}
                        {exam === 'NDA' && 'National Defence Academy'}
                        {exam === 'AFCAT' && 'Air Force Common Admission Test'}
                        {exam === 'Other' && 'Other defence exams'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {formData.examType && (
                <div style={{ marginTop: '15px' }}>
                  <label style={{
                    display: 'block',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    fontSize: '14px'
                  }}>
                    Target Year
                  </label>
                  <select
                    name="targetYear"
                    value={formData.targetYear}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '15px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select target year</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !validateForm()}
            style={{
              width: '100%',
              padding: '16px',
              background: isSubmitting || !validateForm()
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting || !validateForm() ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontFamily: 'inherit',
              marginTop: '10px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && validateForm()) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Setting up your profile...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Complete Setup & Go to Dashboard</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            🎯 Start your defence exam preparation journey today!
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          input:focus, select:focus {
            outline: none !important;
          }
        `}
      </style>
    </div>
  );
}