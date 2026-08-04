// Script to seed default PDF subjects in Firestore
// Run with: node scripts/seed-notes-subjects.js

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, serverTimestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

const DEFAULT_SUBJECTS = [
  { name: 'General Studies', color: '#6c757d', icon: '📚', order: 1, pdfCount: 0 },
  { name: 'Ancient & Medieval History', color: '#dc3545', icon: '🏛️', order: 2, pdfCount: 0 },
  { name: 'Modern History', color: '#fd7e14', icon: '⚔️', order: 3, pdfCount: 0 },
  { name: 'Geography', color: '#198754', icon: '🌍', order: 4, pdfCount: 0 },
  { name: 'Indian Economy', color: '#ffc107', icon: '💰', order: 5, pdfCount: 0 },
  { name: 'Indian Polity', color: '#0d6efd', icon: '🏛️', order: 6, pdfCount: 0 },
  { name: 'Environment & Ecology', color: '#20c997', icon: '🌱', order: 7, pdfCount: 0 },
  { name: 'Science & Technology', color: '#6f42c1', icon: '🔬', order: 8, pdfCount: 0 },
  { name: 'Current Affairs', color: '#d63384', icon: '📰', order: 9, pdfCount: 0 },
  { name: 'Ethics & Integrity', color: '#0caf0f', icon: '⚖️', order: 10, pdfCount: 0 },
  { name: 'International Relations', color: '#6610f2', icon: '🌐', order: 11, pdfCount: 0 },
  { name: 'Art & Culture', color: '#e83e8c', icon: '🎨', order: 12, pdfCount: 0 },
];

async function seedSubjects() {
  console.log('Starting to seed PDF subjects...');
  
  try {
    // Check if subjects already exist
    const existingSubjects = await db.collection('pdfSubjects').limit(1).get();
    
    if (!existingSubjects.empty) {
      console.log('⚠️  Subjects already exist in the database. Skipping seed.');
      console.log('   To re-seed, delete the pdfSubjects collection first.');
      return;
    }

    // Add each subject
    for (const subject of DEFAULT_SUBJECTS) {
      const docRef = db.collection('pdfSubjects').doc();
      await docRef.set({
        ...subject,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Created subject: ${subject.name}`);
    }

    console.log(`\n✨ Successfully seeded ${DEFAULT_SUBJECTS.length} subjects!`);
    console.log('\nNow you can:');
    console.log('1. Go to Admin Dashboard → Notes & PDFs');
    console.log('2. Add PDFs to each subject');
    console.log('3. Students will be able to see subjects and PDFs in the Notes section');
    
  } catch (error) {
    console.error('Error seeding subjects:', error);
  }
  
  process.exit(0);
}

seedSubjects();
