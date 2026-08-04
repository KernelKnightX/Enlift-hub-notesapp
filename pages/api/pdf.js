// This API route fetches PDFs from Firestore using Admin SDK
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase Admin
let adminDb;
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    initializeApp({
      credential: cert(serviceAccount),
      ...firebaseConfig
    });
  } catch (err) {
    console.error('Firebase Admin init error:', err);
  }
}
adminDb = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch PDFs from Firestore pdfs collection
    const pdfsRef = adminDb.collection('pdfs');
    const pdfsSnapshot = await pdfsRef.orderBy('createdAt', 'desc').get();

    const allPdfs = [];

    // Get all PDFs
    pdfsSnapshot.docs.forEach((pdfDoc) => {
      const pdfData = pdfDoc.data();
      allPdfs.push({
        id: pdfDoc.id,
        name: pdfData.title,
        title: pdfData.title,
        url: pdfData.url,
        size: pdfData.size,
        createdAt: pdfData.createdAt ? pdfData.createdAt.toDate?.() || new Date(pdfData.createdAt) : new Date(),
        updatedAt: pdfData.createdAt ? pdfData.createdAt.toDate?.() || new Date(pdfData.createdAt) : new Date(),
        contentType: 'application/pdf',
        pages: pdfData.pages || null,
        subjectId: pdfData.subjectId,
        description: pdfData.description || pdfData.title,
        fullPath: pdfData.url,
      });
    });

    // Sort by upload date (newest first)
    allPdfs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.status(200).json(allPdfs);
  } catch (error) {
    console.error('Error fetching PDFs from Firestore:', error);
    res.status(500).json({
      message: 'Error fetching PDFs',
      error: error.message
    });
  }
}
