// firebase/authService.js
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './config';

class AuthService {
  constructor() {
    this.recaptchaVerifier = null;
    this.currentUser = null;
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  // Initialize reCAPTCHA verifier
  initializeRecaptcha(containerId = 'recaptcha-container') {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA resolved
        },
        'expired-callback': () => {
          this.recaptchaVerifier = null;
        }
      });
    }
    return this.recaptchaVerifier;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber) {
    try {
      // Ensure phone number has country code
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber.replace(/\D/g, '')}`;

      // Initialize reCAPTCHA if not already done
      if (!this.recaptchaVerifier) {
        this.initializeRecaptcha();
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier
      );

      return {
        success: true,
        confirmationResult,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Reset reCAPTCHA on error
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }

      return {
        success: false,
        error: this.getErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Verify OTP
  async verifyOTP(confirmationResult, otp) {
    try {
      const result = await confirmationResult.confirm(otp);
      return {
        success: true,
        user: result.user,
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
        code: error.code
      };
    }
  }

  // Check if user profile exists
  async checkUserExists(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return {
        exists: userDoc.exists(),
        userData: userDoc.exists() ? userDoc.data() : null
      };
    } catch (error) {
      console.error('Error checking user existence:', error);
      return {
        exists: false,
        userData: null,
        error: error.message
      };
    }
  }

  // Save user profile
  async saveUserProfile(uid, profileData) {
    try {
      const userRef = doc(db, 'users', uid);
      const userData = {
        ...profileData,
        uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isProfileComplete: true
      };

      await setDoc(userRef, userData);
      
      return {
        success: true,
        message: 'Profile saved successfully',
        userData
      };
    } catch (error) {
      console.error('Error saving user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update user profile
  async updateUserProfile(uid, updateData) {
    try {
      const userRef = doc(db, 'users', uid);
      const updatedData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updatedData);
      
      return {
        success: true,
        message: 'Profile updated successfully',
        updatedData
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user profile
  async getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          success: true,
          userData: userDoc.data()
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sign out user
  async signOut() {
    try {
      await firebaseSignOut(auth);
      this.currentUser = null;
      
      // Clean up reCAPTCHA
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      
      return {
        success: true,
        message: 'Signed out successfully'
      };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Auth state listener
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Clean up reCAPTCHA
  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/invalid-phone-number': 'Invalid phone number format',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/invalid-verification-code': 'Invalid OTP code',
      'auth/code-expired': 'OTP has expired. Please request a new one',
      'auth/missing-phone-number': 'Phone number is required',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again tomorrow',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed',
      'auth/invalid-app-credential': 'Invalid app credential',
      'auth/app-not-authorized': 'App not authorized for Firebase Authentication',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/web-storage-unsupported': 'Web storage is not supported',
      'auth/operation-not-allowed': 'Phone authentication is not enabled',
    };

    return errorMessages[errorCode] || 'An unexpected error occurred';
  }

  // Utility method to format phone number
  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    return phoneNumber;
  }

  // Validate phone number
  isValidPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length === 10 && /^[6-9]\d{9}$/.test(cleaned);
  }

  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate profile data
  validateProfileData(profileData) {
    const errors = {};
    const required = ['fullName', 'gender', 'dob', 'email', 'city', 'state'];
    
    // Check required fields
    required.forEach(field => {
      if (!profileData[field] || profileData[field].trim() === '') {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Validate email format
    if (profileData.email && !this.isValidEmail(profileData.email)) {
      errors.email = 'Invalid email format';
    }

    // Validate pincode if provided
    if (profileData.pincode && !/^\d{6}$/.test(profileData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    // Validate date of birth
    if (profileData.dob) {
      const birthDate = new Date(profileData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18 || age > 100) {
        errors.dob = 'Age must be between 18 and 100 years';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;