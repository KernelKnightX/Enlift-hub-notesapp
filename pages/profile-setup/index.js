// pages/profile-setup/index.js
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";

export default function ProfileSetup() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Redirect to dashboard if profile already complete or if this page is accessed
    if (!loading && user) {
      router.push('/student-desk/dashboard');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a365d 0%, #2d5a87 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // If no user, don't render (redirect happens in useEffect)
  if (!user) {
    return null;
  }

  // This page should not be accessible anymore since signup now handles everything
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a365d 0%, #2d5a87 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
        <h2>Redirecting to Dashboard...</h2>
        <p>Your profile setup is now handled during signup.</p>
      </div>
    </div>
  );
}