// scripts/grant-admin-simple.js
// Simple script to grant admin access using Firebase Web SDK
// Run with: node scripts/grant-admin-simple.js harshjoshi91577@gmail.com

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Your Firebase config (from .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyCxiW-EFA2zGgHvsCm88s6wpDg_Fcxnelk",
  authDomain: "crackcds-ee317.firebaseapp.com",
  projectId: "crackcds-ee317",
  storageBucket: "crackcds-ee317.firebasestorage.app",
  messagingSenderId: "912938842265",
  appId: "1:912938842265:web:14f4e9b89fee4201382008"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function grantAdminAccess(email, adminPassword) {
  try {
    console.log(`🔄 Granting admin access to: ${email}`);

    // Sign in as admin to get permission to update
    console.log('Signing in as admin...');
    await signInWithEmailAndPassword(auth, email, adminPassword);
    console.log('✅ Signed in successfully');

    // Update the user document to grant admin access
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userDocRef, {
      isAdmin: true,
      adminGrantedAt: new Date(),
      adminGrantedBy: 'system'
    });

    console.log('✅ Admin access granted successfully!');
    console.log(`User: ${email}`);
    console.log('You can now access /admin routes.');

    // Sign out
    await auth.signOut();
    console.log('✅ Signed out');

  } catch (error) {
    console.error('❌ Error granting admin access:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the user is already registered');
    console.log('2. Check that you have the correct password');
    console.log('3. Ensure Firebase security rules allow this operation');
  }
}

// Get arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('❌ Please provide email and password as arguments');
  console.log('Usage: node scripts/grant-admin-simple.js user@example.com password');
  process.exit(1);
}

grantAdminAccess(email, password);