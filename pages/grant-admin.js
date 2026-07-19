import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function GrantAdmin() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setStatus('not-logged-in');
      return;
    }

    async function grantAdmin() {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          setError('User document not found');
          setStatus('error');
          return;
        }
        
        const userData = userSnap.data();
        
        if (userData.isAdmin === true) {
          setStatus('already-admin');
          return;
        }
        
        await updateDoc(userRef, {
          isAdmin: true,
          adminGrantedAt: new Date()
        });
        
        setStatus('success');
        
        // Redirect to admin after 2 seconds
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
        
      } catch (err) {
        console.error(err);
        setError(err.message);
        setStatus('error');
      }
    }

    grantAdmin();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (status === 'not-logged-in') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
        <h1>Please Log In</h1>
        <p>You need to be logged in to grant admin access.</p>
        <button 
          onClick={() => router.push('/login')}
          style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (status === 'already-admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
        <h1>You Already Have Admin Access!</h1>
        <p>Redirecting you to the admin dashboard...</p>
        <button 
          onClick={() => router.push('/admin')}
          style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: '#10b981' }}>✅ Admin Access Granted!</h1>
        <p>Redirecting you to the admin dashboard...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: '#ef4444' }}>❌ Error</h1>
        <p>{error}</p>
        <button 
          onClick={() => router.push('/')}
          style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', background: '#6b7280', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Go Home
        </button>
      </div>
    );
  }

  return null;
}
