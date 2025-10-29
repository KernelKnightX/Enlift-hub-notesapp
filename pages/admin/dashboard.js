import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db, storage } from '../../firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const AdminDashboard = () => {
  // Auth states
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Data states
  const [subjects, setSubjects] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [uploading, setUploading] = useState(false);

  // ⚙️ Firebase Storage configuration
  const STORAGE_FOLDER = 'pdfs';

  // 🔐 Check admin access
  const checkAdmin = async (uid) => {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', uid));
      return adminDoc.exists() && adminDoc.data().isAdmin === true;
    } catch (err) {
      console.error('Admin check error:', err);
      return false;
    }
  };

  // 👂 Listen to auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const admin = await checkAdmin(currentUser.uid);
        setUser(currentUser);
        setIsAdmin(admin);
        if (admin) loadSubjects();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔑 Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const admin = await checkAdmin(userCredential.user.uid);
      if (!admin) {
        await signOut(auth);
        setError('Access denied. Not an admin.');
        return;
      }
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Login failed. Check credentials.');
      console.error(err);
    }
  };

  // 🚪 Logout
  const handleLogout = () => signOut(auth);

  // 📚 Load subjects
  const loadSubjects = async () => {
    try {
      const q = query(collection(db, 'subjects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const subjectsData = await Promise.all(
        snapshot.docs.map(async (subjectDoc) => {
          const pdfsSnapshot = await getDocs(collection(db, 'subjects', subjectDoc.id, 'pdfs'));
          return {
            id: subjectDoc.id,
            ...subjectDoc.data(),
            pdfs: pdfsSnapshot.docs.map((pdfDoc) => ({
              id: pdfDoc.id,
              ...pdfDoc.data(),
            })),
          };
        })
      );
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Load error:', err);
    }
  };

  // ➕ Add subject
  const addSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setUploading(true);
    try {
      await addDoc(collection(db, 'subjects'), {
        name: subjectName.trim(),
        createdAt: new Date(),
        createdBy: user.uid,
      });
      setSubjectName('');
      await loadSubjects();
    } catch (err) {
      alert('Failed to add subject');
      console.error(err);
    }
    setUploading(false);
  };

  // 🗑️ Delete subject
  const deleteSubject = async (subjectId) => {
    if (!window.confirm('Delete this subject and all PDFs?')) return;
    setUploading(true);
    try {
      const pdfsSnapshot = await getDocs(collection(db, 'subjects', subjectId, 'pdfs'));
      for (const pdfDoc of pdfsSnapshot.docs) {
        await deleteDoc(doc(db, 'subjects', subjectId, 'pdfs', pdfDoc.id));
      }
      await deleteDoc(doc(db, 'subjects', subjectId));
      await loadSubjects();
    } catch (err) {
      alert('Failed to delete subject');
      console.error(err);
    }
    setUploading(false);
  };

  // ☁️ Upload PDF to Firebase Storage
  const uploadPDF = async (e, subjectId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        if (file.type !== 'application/pdf') {
          alert(`${file.name} is not a PDF`);
          continue;
        }

        // Create unique filename with timestamp
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storagePath = `${STORAGE_FOLDER}/${subjectId}/${fileName}`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Save PDF metadata to Firestore
        await addDoc(collection(db, 'subjects', subjectId, 'pdfs'), {
          name: file.name,
          storagePath: storagePath,
          url: downloadURL,
          size: (file.size / 1024).toFixed(2) + ' KB',
          uploadedAt: new Date(),
          uploadedBy: user.uid,
        });

        // PDF uploaded successfully
      }

      await loadSubjects();
      e.target.value = '';
      alert('PDF(s) uploaded successfully!');
    } catch (err) {
      alert('Upload failed: ' + err.message);
      console.error(err);
    }
    setUploading(false);
  };

  // 🗑️ Delete single PDF
  const deletePDF = async (subjectId, pdfId, pdfData) => {
    if (!window.confirm('Delete this PDF?')) return;
    setUploading(true);
    try {
      // Delete from Firebase Storage if storagePath exists
      if (pdfData.storagePath) {
        const storageRef = ref(storage, pdfData.storagePath);
        await deleteObject(storageRef);
        // PDF deleted from storage
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'subjects', subjectId, 'pdfs', pdfId));
      await loadSubjects();
    } catch (err) {
      alert('Failed to delete PDF');
      console.error(err);
    }
    setUploading(false);
  };

  // 🧭 Loading state
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // 🔐 Login screen
  if (!user || !isAdmin) {
    return (
      <div style={styles.center}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Admin Login</h1>
          </div>

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="admin@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" style={styles.primaryBtn}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🏠 Main Admin UI
  const totalPDFs = subjects.reduce((sum, s) => sum + (s.pdfs?.length || 0), 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📚 Admin Dashboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
            Manage subjects and PDFs (Firebase Storage)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem' }}>{user.email}</span>
          <button onClick={handleLogout} style={styles.secondaryBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>📚</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e40af' }}>
            {subjects.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Subjects</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>📄</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc2626' }}>
            {totalPDFs}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>PDFs</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>🎯</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#7c3aed' }}>
            SSB
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Test Management</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>☁️</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#059669' }}>
            Active
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Firebase Storage</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>⚡ Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link href="/admin/ssb-content" style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.quickActionCard, backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <div style={{ fontWeight: '600', color: '#92400e' }}>SSB Test Management</div>
                <div style={{ fontSize: '0.875rem', color: '#a16207' }}>Manage OIR, PPDT, TAT, WAT, SRT content</div>
              </div>
            </Link>
            <a href="/admin/mock-tests" style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.quickActionCard, backgroundColor: '#e0f2fe', border: '1px solid #0284c7' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                <div style={{ fontWeight: '600', color: '#0c4a6e' }}>Mock Test Management</div>
                <div style={{ fontSize: '0.875rem', color: '#075985' }}>Create and manage mock tests</div>
              </div>
            </a>
            <a href="/admin/pyq" style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.quickActionCard, backgroundColor: '#fef3c7', border: '1px solid #f59e0b' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontWeight: '600', color: '#92400e' }}>PYQ Management</div>
                <div style={{ fontSize: '0.875rem', color: '#a16207' }}>Upload PYQ PDFs and questions</div>
              </div>
            </a>
            <a href="/admin/users" style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.quickActionCard, backgroundColor: '#fee2e2', border: '1px solid #dc2626' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                <div style={{ fontWeight: '600', color: '#991b1b' }}>User Management</div>
                <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Manage users and permissions</div>
              </div>
            </a>
            <a href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{ ...styles.quickActionCard, backgroundColor: '#ede9fe', border: '1px solid #8b5cf6' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛠️</div>
                <div style={{ fontWeight: '600', color: '#6b21a8' }}>Main Admin Dashboard</div>
                <div style={{ fontSize: '0.875rem', color: '#7c3aed' }}>SSB management overview</div>
              </div>
            </a>
            <div style={{ ...styles.quickActionCard, backgroundColor: '#f0fdf4', border: '1px solid #10b981' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
              <div style={{ fontWeight: '600', color: '#065f46' }}>Study Materials</div>
              <div style={{ fontSize: '0.875rem', color: '#047857' }}>Manage PDF subjects and documents</div>
            </div>
          </div>
        </div>

        {/* Add Subject */}
        <div style={styles.card}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>➕ Add New Subject</h2>
          <form onSubmit={addSubject} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Enter subject name"
              style={{ ...styles.input, flex: 1 }}
              disabled={uploading}
            />
            <button type="submit" style={styles.primaryBtn} disabled={uploading}>
              {uploading ? '⏳' : 'Add'}
            </button>
          </form>
        </div>

        {/* Subjects list */}
        {subjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <h3>No subjects yet</h3>
            <p>Create your first subject to get started</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {subjects.map((subject) => (
              <div key={subject.id} style={styles.subjectCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{subject.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {subject.pdfs?.length || 0} PDFs
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSubject(subject.id)}
                    style={styles.deleteBtn}
                    disabled={uploading}
                  >
                    🗑️
                  </button>
                </div>

                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => uploadPDF(e, subject.id)}
                  style={styles.fileInput}
                  disabled={uploading}
                />

                {subject.pdfs && subject.pdfs.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    {subject.pdfs.map((pdf) => (
                      <div key={pdf.id} style={styles.pdfItem}>
                        <span style={{ fontSize: '0.875rem' }}>{pdf.name}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => window.open(pdf.url, '_blank')}
                            style={styles.viewBtn}
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => deletePDF(subject.id, pdf.id, pdf)}
                            style={styles.deleteBtn}
                            disabled={uploading}
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {uploading && (
        <div style={styles.overlay}>
          <div style={styles.loadingBox}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 Styles
const styles = {
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  loginCard: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' },
  primaryBtn: { padding: '0.75rem 1rem', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '0.375rem', fontWeight: '500', cursor: 'pointer' },
  secondaryBtn: { padding: '0.5rem 1rem', backgroundColor: 'white', color: '#1e40af', border: '1px solid #1e40af', borderRadius: '0.375rem', cursor: 'pointer' },
  container: { minHeight: '100vh', backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#1e40af', color: 'white', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stats: { padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  statCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  content: { padding: '0 2rem 2rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
  subjectCard: { backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  fileInput: { width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.75rem' },
  pdfItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '0.5rem' },
  viewBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' },
  deleteBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  loadingBox: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  quickActionCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' },
};

export default AdminDashboard;