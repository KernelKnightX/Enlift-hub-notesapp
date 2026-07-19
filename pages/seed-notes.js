import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, serverTimestamp } from 'firebase/firestore';

const DEFAULT_SUBJECTS = [
  { name: 'General Studies', color: '#6c757d', icon: '📚', order: 1 },
  { name: 'Ancient & Medieval History', color: '#dc3545', icon: '🏛️', order: 2 },
  { name: 'Modern History', color: '#fd7e14', icon: '⚔️', order: 3 },
  { name: 'Geography', color: '#198754', icon: '🌍', order: 4 },
  { name: 'Indian Economy', color: '#ffc107', icon: '💰', order: 5 },
  { name: 'Indian Polity', color: '#0d6efd', icon: '🏛️', order: 6 },
  { name: 'Environment & Ecology', color: '#20c997', icon: '🌱', order: 7 },
  { name: 'Science & Technology', color: '#6f42c1', icon: '🔬', order: 8 },
  { name: 'Current Affairs', color: '#d63384', icon: '📰', order: 9 },
  { name: 'Ethics & Integrity', color: '#0caf0f', icon: '⚖️', order: 10 },
  { name: 'International Relations', color: '#6610f2', icon: '🌐', order: 11 },
  { name: 'Art & Culture', color: '#e83e8c', icon: '🎨', order: 12 },
];

export default function SeedNotes() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error, exists
  const [counts, setCounts] = useState({ subjects: 0, pdfs: 0 });

  useEffect(() => {
    // Check current counts
    async function checkCounts() {
      try {
        const subjectsSnap = await getDocs(collection(db, 'pdfSubjects'));
        const pdfsSnap = await getDocs(collection(db, 'pdfs'));
        setCounts({
          subjects: subjectsSnap.size,
          pdfs: pdfsSnap.size
        });
        
        if (subjectsSnap.size > 0) {
          setStatus('exists');
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkCounts();
  }, []);

  async function seedSubjects() {
    setStatus('loading');
    try {
      // Check if subjects already exist
      const existing = await getDocs(collection(db, 'pdfSubjects'));
      if (!existing.empty) {
        setStatus('exists');
        return;
      }

      // Create each subject
      for (const subject of DEFAULT_SUBJECTS) {
        const docRef = doc(collection(db, 'pdfSubjects'));
        await setDoc(docRef, {
          ...subject,
          pdfCount: 0,
          createdAt: serverTimestamp()
        });
      }

      setStatus('success');
      
      // Refresh counts
      const subjectsSnap = await getDocs(collection(db, 'pdfSubjects'));
      setCounts(prev => ({ ...prev, subjects: subjectsSnap.size }));
      
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif', 
      padding: '20px',
      background: '#f5f5f5'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>📝 Notes Setup</h1>
        
        {status === 'idle' && (
          <>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Click below to create default subjects for the Notes section.
            </p>
            <button 
              onClick={seedSubjects}
              style={{ 
                padding: '12px 24px', 
                fontSize: '16px',
                cursor: 'pointer', 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px' 
              }}
            >
              Create Default Subjects
            </button>
          </>
        )}

        {status === 'loading' && (
          <p>Creating subjects...</p>
        )}

        {status === 'exists' && (
          <>
            <p style={{ color: '#10b981', fontSize: '18px', marginBottom: '10px' }}>
              ✅ Subjects Already Exist!
            </p>
            <p style={{ color: '#666' }}>
              Current: {counts.subjects} subjects, {counts.pdfs} PDFs
            </p>
            <p style={{ color: '#666', marginTop: '20px' }}>
              Go to <strong>/student-desk/notes</strong> to view.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <p style={{ color: '#10b981', fontSize: '18px', marginBottom: '10px' }}>
              ✅ Subjects Created Successfully!
            </p>
            <p style={{ color: '#666' }}>
              Created: {DEFAULT_SUBJECTS.length} subjects
            </p>
            <p style={{ color: '#666', marginTop: '20px' }}>
              Go to <strong>/student-desk/notes</strong> to see them.
            </p>
            <button 
              onClick={() => window.location.href = '/student-desk/notes'}
              style={{ 
                marginTop: '15px',
                padding: '10px 20px', 
                cursor: 'pointer', 
                background: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px' 
              }}
            >
              Go to Notes
            </button>
          </>
        )}

        {status === 'error' && (
          <p style={{ color: '#ef4444' }}>Error creating subjects. Please try again.</p>
        )}
      </div>
    </div>
  );
}
