// components/auth/AuthForm.js
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';  // ✅ Use AuthContext
import { useRouter } from 'next/router';

export default function AuthForm() {
  const { login, signup } = useAuth();  // ✅ Get functions from context
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(router.pathname === '/login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  });

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // LOGIN
        await login(formData.email, formData.password);
        // User object will be set by AuthContext's onAuthStateChanged
        // Redirect will happen automatically via login page's useEffect
      } else {
        // SIGNUP
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await signup(formData.email, formData.password, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          city: formData.city,
          hasGivenSSB: formData.hasGivenSSB,
          ssbAttempts: formData.ssbAttempts,
          preparingForDefence: formData.preparingForDefence,
          examType: formData.examType,
          targetYear: formData.targetYear,
          isProfileComplete: true
        });

        // After signup, redirect directly to dashboard
        router.push('/student-desk/dashboard');
      }
    } catch (error) {
      // Show user-friendly error messages
      let errorMessage = 'An error occurred. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h4 className="text-center mb-4">
                {isLogin ? '🔐 Welcome Back!' : '✨ Create Account'}
              </h4>

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required={!isLogin}
                        disabled={loading}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        className="form-control"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+91 9876543210"
                        required={!isLogin}
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                    disabled={loading}
                  />
                  {!isLogin && (
                    <small className="text-muted">Must be at least 6 characters</small>
                  )}
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      required
                      disabled={loading}
                    />
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    isLogin ? 'Login' : 'Sign Up'
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <p className="text-center mb-0">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  className="btn btn-link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setFormData({
                      email: '',
                      password: '',
                      confirmPassword: '',
                      fullName: '',
                      phoneNumber: ''
                    });
                  }}
                  disabled={loading}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}