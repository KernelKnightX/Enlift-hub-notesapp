// pages/register/index.jsx
import AuthForm from '../../components/auth/AuthForm';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function RegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/student-desk/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-vh-100 d-flex align-items-center py-5 bg-light">
      <AuthForm />
    </div>
  );
}