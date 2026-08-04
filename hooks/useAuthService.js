// Unified Authentication Hook
// Consolidates auth logic from authService.js and AuthContext

import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase/config';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getIdToken
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Error message mapping
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email address format',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password is too weak',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/operation-not-allowed': 'Operation not allowed. Please contact support.',
    'auth/admin-restricted-operation': 'Admin restricted operation. Please contact support.',
    'auth/invalid-phone-number': 'Invalid phone number format',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/invalid-verification-code': 'Invalid OTP code',
    'auth/code-expired': 'OTP has expired. Please request a new one',
    'auth/missing-phone-number': 'Phone number is required',
  };
  return errorMessages[errorCode] || 'An unexpected error occurred';
};

export function useAuthService() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state listener
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous Firestore listener
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (firebaseUser) {
        try {
          // Get fresh token
          await firebaseUser.getIdToken();
          
          // Use onSnapshot for real-time profile updates
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  ...userData
                });
                setProfile(userData);
              } else {
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email
                });
                setProfile(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Firestore listener error:', error);
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email
              });
              setProfile(null);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error('Error setting up user listener:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
          setProfile(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Login with email/password
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);
      return result.user;
    } catch (err) {
      const errorMsg = getErrorMessage(err.code);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Signup with email/password
  const signup = useCallback(async (email, password, userData = {}) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        ...userData,
        createdAt: new Date(),
        isAdmin: false,
        isProfileComplete: false
      });

      return result.user;
    } catch (err) {
      const errorMsg = getErrorMessage(err.code);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      const errorMsg = getErrorMessage(err.code);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    setError(null);
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      const errorMsg = getErrorMessage(err.code);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    setError(null);
    try {
      if (!user) throw new Error('No user logged in');
      
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        isProfileComplete: true,
        updatedAt: new Date()
      }, { merge: true });

      // Profile will auto-update via onSnapshot listener
      return true;
    } catch (err) {
      const errorMsg = err.message || 'Failed to update profile';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [user]);

  // Check if user is admin
  const isAdmin = profile?.isAdmin === true;

  // Get ID token
  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return await user.getIdToken();
  }, [user]);

  return {
    user,
    profile,
    loading,
    error,
    isAdmin,
    login,
    signup,
    logout,
    forgotPassword,
    updateProfile,
    getIdToken,
    clearError: () => setError(null)
  };
}

export default useAuthService;
