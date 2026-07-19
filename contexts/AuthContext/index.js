// contexts/AuthContext/index.js - Contains the AuthContext and AuthProvider
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verificationId, setVerificationId] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribeFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous Firestore listener
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (firebaseUser) {
        // User is logged in
        try {
          // Get fresh token
          await firebaseUser.getIdToken();
          
          // Use onSnapshot - with error handling for permission issues
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          unsubscribeFirestore = onSnapshot(
            userDocRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  ...docSnapshot.data()
                });
              } else {
                // Document doesn't exist yet - user might be newly signed up
                // Create a basic user profile
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email
                });
              }
              setAuthLoading(false);
            },
            (error) => {
              // Handle permission-denied errors gracefully
              // This can happen if the user document doesn't exist yet
              console.warn('Firestore listener error (can be ignored):', error.message);
              // Set user with basic info from Firebase Auth
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email
              });
              setAuthLoading(false);
            }
          );
        } catch (error) {
          console.error('Error setting up user listener:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
          setAuthLoading(false);
        }
      } else {
        // User is logged out
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // FORGOT PASSWORD - Send reset email
  const forgotPassword = async (email) => {
    try {
      if (!email) {
        throw new Error('Email is required');
      }
      
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Failed to send reset email. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // LOGIN function
  const login = async (email, password) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/invalid-api-key':
          errorMessage = 'Firebase configuration error. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password login is not enabled. Please contact support.';
          break;
        case 'auth/admin-restricted-operation':
          errorMessage = 'Admin restricted operation. Please contact support.';
          break;
        default:
          // For unknown errors, include the message for debugging
          errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // SIGNUP function
  const signup = async (email, password, userData = {}) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);

      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        ...userData,
        createdAt: new Date(),
        isAdmin: false // Users are not admin by default
      });

      return result.user;
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Signup error code:', error.code);
      
      let errorMessage;
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password signup is not enabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Failed to create account. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // PHONE LOGIN - Send OTP
  const sendPhoneOtp = async (phoneNumber) => {
    try {
      // Format phone number with country code if not already formatted
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhone = '+91' + phoneNumber;
      }
      
      // Use the global recaptchaVerifier if available
      const verifier = window.recaptchaVerifier || null;
      
      // This will trigger the reCAPTCHA flow
      const verificationId = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setVerificationId(verificationId);
      return verificationId;
    } catch (error) {
      console.error('Send OTP error:', error);
      
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-phone-number':
          errorMessage = 'Invalid phone number';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/captcha-check-failed':
          errorMessage = 'Verification failed. Please try again.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Phone login is not enabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Failed to send OTP. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // PHONE LOGIN - Verify OTP
  const verifyPhoneOtp = async (otp) => {
    try {
      if (!verificationId) {
        throw new Error('Please request OTP first');
      }
      
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      await result.user.getIdToken(true);
      return result.user;
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid OTP. Please try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'OTP has expired. Please request a new one.';
          break;
        case 'auth/session-expired':
          errorMessage = 'Session expired. Please request a new OTP.';
          break;
        default:
          errorMessage = error.message || 'Verification failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  // UPDATE user profile
  const updateUserProfile = async (profileData) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        isProfileComplete: true,
        updatedAt: new Date()
      }, { merge: true });

      // User state will auto-update via onSnapshot listener
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // LOGOUT function
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    authLoading,
    login,
    signup,
    logout,
    updateUserProfile,
    sendPhoneOtp,
    verifyPhoneOtp,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
