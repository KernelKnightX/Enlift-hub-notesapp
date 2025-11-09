'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import EmailLogin from '../../components/login/EmailLogin';
import EmailSignup from '../../components/login/EmailSignup';

export default function LoginPage() {
  const { user, login, signup } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

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
    await login(credentials.email, credentials.password);
  };

  const handleSignup = async (formData) => {
    try {
      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        city: formData.city,
        hasGivenSSB: formData.hasGivenSSB,
        ssbAttempts: formData.ssbAttempts,
        preparingForDefence: formData.preparingForDefence,
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

  return (
    <div className="min-vh-100 d-flex align-items-center py-5 bg-light">
      {isLogin ? (
        <EmailLogin
          onLogin={handleLogin}
          onSwitchToSignup={() => setIsLogin(false)}
        />
      ) : (
        <EmailSignup
          onSignup={handleSignup}
          onSwitchToLogin={() => setIsLogin(true)}
        />
      )}
    </div>
  );
}
