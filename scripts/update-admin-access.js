// Script to update user document with admin access
// Run this in your browser console while logged in as admin

// Import Firebase (adjust path as needed)
import { db } from '../firebase/config.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

async function grantAdminAccess() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }

    console.log('Current user:', user.email, user.uid);

    // Update user document with isAdmin: true
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      isAdmin: true,
      updatedAt: new Date()
    });

    console.log('✅ Successfully granted admin access to user document');

    // Verify the update
    const updatedDoc = await getDoc(userRef);
    console.log('Updated user data:', updatedDoc.data());

  } catch (error) {
    console.error('❌ Error granting admin access:', error);
  }
}

// Run the function
grantAdminAccess();