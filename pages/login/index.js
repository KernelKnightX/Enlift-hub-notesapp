import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import EmailLogin from '../../components/login/EmailLogin';
import PhoneLogin from '../../components/login/PhoneLogin';
import EmailSignup from '../../components/login/EmailSignup';
import ForgotPassword from '../../components/login/ForgotPassword';

export default function LoginPage() {
  const { user, login, signup } = useAuth();
  const router = useRouter();
  
  // loginType: 'email' | 'phone'
  // view: 'login' | 'signup' | 'forgotPassword'
  const [loginType, setLoginType] = useState('email');
  const [view, setView] = useState('login');

  useEffect(() => {
    if (user) {
      // Add a small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        router.push('/student-desk/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
    } catch (error) {
      // Re-throw the error so EmailLogin can catch it
      throw error;
    }
  };

  const handleSignup = async (formData) => {
    try {
      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        city: formData.city,
        examType: formData.examType,
        targetYear: formData.targetYear
      });
      // Don't manually redirect - let the useEffect handle it when user state updates
    } catch (error) {
      console.error('Signup error:', error);
      // Error will be handled by the EmailSignup component
      throw error;
    }
  };

  // Render the appropriate component based on state
  const renderContent = () => {
    if (view === 'signup') {
      return (
        <EmailSignup
          onSignup={handleSignup}
          onSwitchToLogin={() => setView('login')}
        />
      );
    }

    if (view === 'forgotPassword') {
      return (
        <ForgotPassword
          onBackToLogin={() => setView('login')}
        />
      );
    }

    if (loginType === 'phone') {
      return (
        <PhoneLogin
          onLogin={() => {}}
          onSwitchToEmail={() => setLoginType('email')}
          onSwitchToSignup={() => setView('signup')}
        />
      );
    }

    return (
      <EmailLogin
        onLogin={handleLogin}
        onSwitchToSignup={() => setView('signup')}
        onSwitchToPhone={() => setLoginType('phone')}
        onForgotPassword={() => setView('forgotPassword')}
      />
    );
  };

  return (
    <div className="min-vh-100 d-flex align-items-center py-5 bg-light">
      {renderContent()}
    </div>
  );
}
