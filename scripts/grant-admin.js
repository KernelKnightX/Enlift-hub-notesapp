// Script to grant admin access using Firebase Admin SDK
// Run with: node scripts/grant-admin.js user@email.com

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function grantAdminAccess(email) {
  try {
    console.log(`🔄 Looking for user: ${email}`);

    // Find user by email - query users collection
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('❌ User not found. The user must register first.');
      console.log('   Please have the user log in at least once before granting admin access.');
      process.exit(1);
    }

    // Get the first matching user
    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log(`✅ Found user: ${userData.email || email}`);
    console.log(`   User ID: ${userId}`);

    // Check if already admin
    if (userData.isAdmin === true) {
      console.log('⚠️  User already has admin access!');
      process.exit(0);
    }

    // Grant admin access
    await usersRef.doc(userId).update({
      isAdmin: true,
      adminGrantedAt: new Date(),
      adminGrantedBy: 'system'
    });

    console.log('✅ Admin access granted successfully!');
    console.log(`\nUser: ${email}`);
    console.log('You can now access /admin routes.');

  } catch (error) {
    console.error('❌ Error granting admin access:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide email as argument');
  console.log('Usage: node scripts/grant-admin.js user@example.com');
  process.exit(1);
}

grantAdminAccess(email);
