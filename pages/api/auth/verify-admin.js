import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken } = req.body || {};

    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User not found', isAdmin: false });
    }

    const userData = userDoc.data();
    const isAdmin = userData.isAdmin === true;

    return res.status(200).json({
      uid,
      email: decodedToken.email,
      isAdmin,
      userData: {
        fullName: userData.fullName,
        email: userData.email,
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired', isAdmin: false });
    }
    return res.status(500).json({ error: 'Verification failed', isAdmin: false });
  }
}
