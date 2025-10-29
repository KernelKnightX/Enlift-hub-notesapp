// contexts/AuthContext/index.js - Contains the AuthContext and AuthProvider
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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
          
          // Use onSnapshot instead of getDoc - it handles auth timing better
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
                // Document doesn't exist yet
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email
                });
              }
              setAuthLoading(false);
            },
            (error) => {
              console.error('Firestore listener error:', error);
              // Set user with basic info even if Firestore fails
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

  // LOGIN function
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // SIGNUP function
  const signup = async (email, password, userData = {}) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await result.user.getIdToken(true);

      // Wait a bit for token to propagate
      await new Promise(resolve => setTimeout(resolve, 500));

      await setDoc(doc(db, 'users', result.user.uid), {
        email: email,
        ...userData,
        createdAt: new Date(),
        isProfileComplete: false,
        isAdmin: false // Users are not admin by default - use scripts/update-admin-access.js to grant admin access
      });

      // Wait for Firestore write to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      return result.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
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
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
