import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../../firebase/config';
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
  orderBy,
  updateDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const AdminPYQ = () => {
  // Auth states
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // PYQ Data
  const [pyqs, setPyqs] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Upload Form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingPyq, setEditingPyq] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    examType: 'prelims',
    paper: 'gs1',
    subject: 'general',
    year: '',
    file: null
  });

  // UPSC Categories
  const EXAM_TYPES = [
    { id: 'prelims', label: 'Prelims' },
    { id: 'mains', label: 'Mains' }
  ];

  const PAPER_TYPES = [
    { id: 'gs1', label: 'GS Paper 1', exam: 'prelims' },
    { id: 'gs2', label: 'GS Paper 2', exam: 'prelims' },
    { id: 'csat', label: 'CSAT Paper 2', exam: 'prelims' },
    { id: 'essay', label: 'Essay', exam: 'mains' },
    { id: 'gs1_mains', label: 'GS Paper 1', exam: 'mains' },
    { id: 'gs2_mains', label: 'GS Paper 2', exam: 'mains' },
    { id: 'gs3_mains', label: 'GS Paper 3', exam: 'mains' },
    { id: 'gs4_mains', label: 'GS Paper 4', exam: 'mains' },
  ];

  const SUBJECTS = [
    { id: 'history', label: 'History' },
    { id: 'geography', label: 'Geography' },
    { id: 'polity', label: 'Polity' },
    { id: 'economy', label: 'Economy' },
    { id: 'science', label: 'Science & Tech' },
    { id: 'environment', label: 'Environment' },
    { id: 'current_affairs', label: 'Current Affairs' },
    { id: 'ethics', label: 'Ethics' },
    { id: 'international', label: 'International Relations' },
    { id: 'csat_quant', label: 'CSAT - Quantitative' },
    { id: 'csat_reasoning', label: 'CSAT - Reasoning' },
    { id: 'csat_comprehension', label: 'CSAT - Comprehension' },
    { id: 'general', label: 'General' },
  ];

  // 🔐 Check admin access
  const checkAdmin = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() && userDoc.data().isAdmin === true;
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
        if (admin) loadPyqs();
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

  // 📚 Load PYQs
  const loadPyqs = async () => {
    try {
      const q = query(collection(db, 'pyqs'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const pyqList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPyqs(pyqList);
    } catch (err) {
      console.error('Load error:', err);
      alert('Error loading PYQs. Please check your Firestore security rules.');
    }
  };

  // 📤 Upload PYQ
  const uploadPyq = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim() || !uploadForm.examType || !uploadForm.file) {
      alert('Please fill all required fields and select a PDF file.');
      return;
    }

    setUploading(true);
    try {
      // Upload file to Firebase Storage
      const fileRef = ref(storage, `pyqs/${Date.now()}_${uploadForm.file.name}`);
      const snapshot = await uploadBytes(fileRef, uploadForm.file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      const pyqData = {
        title: uploadForm.title.trim(),
        description: uploadForm.description.trim(),
        examType: uploadForm.examType,
        paper: uploadForm.paper,
        subject: uploadForm.subject,
        year: uploadForm.year.trim(),
        fileName: uploadForm.file.name,
        fileSize: uploadForm.file.size,
        downloadURL,
        storagePath: fileRef.fullPath,
        updatedAt: new Date(),
        updatedBy: user.uid
      };

      if (editingPyq) {
        await updateDoc(doc(db, 'pyqs', editingPyq.id), pyqData);
      } else {
        pyqData.createdAt = new Date();
        pyqData.createdBy = user.uid;
        await addDoc(collection(db, 'pyqs'), pyqData);
      }

      resetForm();
      await loadPyqs();
      alert(editingPyq ? 'PYQ updated successfully!' : 'PYQ uploaded successfully!');
    } catch (err) {
      alert('Failed to upload PYQ');
      console.error(err);
    }
    setUploading(false);
  };

  // ✏️ Edit PYQ
  const editPyq = (pyq) => {
    setEditingPyq(pyq);
    setUploadForm({
      title: pyq.title || '',
      description: pyq.description || '',
      examType: pyq.examType || 'prelims',
      paper: pyq.paper || 'gs1',
      subject: pyq.subject || 'general',
      year: pyq.year || '',
      file: null
    });
    setShowUploadForm(true);
  };

  // 🗑️ Delete PYQ
  const deletePyq = async (pyqId, storagePath) => {
    if (!window.confirm('Delete this PYQ? This action cannot be undone.')) return;
    setUploading(true);
    try {
      // Delete from Storage
      if (storagePath) {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'pyqs', pyqId));
      await loadPyqs();
    } catch (err) {
      alert('Failed to delete PYQ');
      console.error(err);
    }
    setUploading(false);
  };

  // 🔄 Reset Form
  const resetForm = () => {
    setUploadForm({
      title: '',
      description: '',
      examType: 'prelims',
      paper: 'gs1',
      subject: 'general',
      year: '',
      file: null
    });
    setEditingPyq(null);
    setShowUploadForm(false);
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
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>📄 Admin - PYQ Management</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.875rem' }}>
            Upload and manage Previous Year Question papers
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
          <div style={{ fontSize: '2rem' }}>📄</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e40af' }}>
            {pyqs.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total PYQs</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>📁</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc2626' }}>
            {pyqs.reduce((acc, pyq) => acc + (pyq.fileSize ? 1 : 0), 0)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Files Uploaded</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '2rem' }}>📊</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#059669' }}>
            {(pyqs.reduce((acc, pyq) => acc + (pyq.fileSize || 0), 0) / (1024 * 1024)).toFixed(1)} MB
          </div>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Size</div>
        </div>
      </div>

      {/* Upload Button */}
      <div style={styles.content}>
        <div style={styles.card}>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={styles.primaryBtn}
            disabled={uploading}
          >
            {showUploadForm ? 'Cancel Upload' : '+ Upload New PYQ'}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div style={styles.card}>
            <h3 style={{ marginBottom: '1rem' }}>
              {editingPyq ? 'Edit PYQ' : 'Upload New PYQ'}
            </h3>

            <form onSubmit={uploadPyq}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={styles.label}>PYQ Title *</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      style={styles.input}
                      placeholder="e.g., UPSC Prelims 2023 GS Paper I"
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Exam Type *</label>
                    <select
                      value={uploadForm.examType}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, examType: e.target.value }))}
                      style={styles.input}
                      required
                    >
                      <option value="">Select Exam Type</option>
                      <option value="prelims">UPSC Prelims</option>
                      <option value="mains">UPSC Mains</option>
                      <option value="CDS">CDS (Combined Defence Services)</option>
                      <option value="AFCAT">AFCAT (Air Force Common Admission Test)</option>
                      <option value="NDA">NDA (National Defence Academy)</option>
                      <option value="CAPF">CAPF (Central Armed Police Forces)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                {/* Paper and Subject Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={styles.label}>Paper *</label>
                    <select
                      value={uploadForm.paper}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, paper: e.target.value }))}
                      style={styles.input}
                      required
                    >
                      <option value="gs1">GS Paper I (History, Geography, Polity, Economy)</option>
                      <option value="gs2">GS Paper II (Governance, International Relations)</option>
                      <option value="gs3">GS Paper III (Science, Technology, Security)</option>
                      <option value="gs4">GS Paper IV (Ethics, Integrity, Aptitude)</option>
                      <option value="csat">CSAT (Comprehension, Reasoning, Quantitative)</option>
                      <option value="essay">Essay Paper</option>
                      <option value="eng">English (Compulsory)</option>
                      <option value="hindi">Hindi (Compulsory)</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Subject *</label>
                    <select
                      value={uploadForm.subject}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                      style={styles.input}
                      required
                    >
                      <option value="history">History</option>
                      <option value="geography">Geography</option>
                      <option value="polity">Polity & Governance</option>
                      <option value="economy">Economy</option>
                      <option value="science">Science & Technology</option>
                      <option value="environment">Environment & Ecology</option>
                      <option value="international">International Relations</option>
                      <option value="security">Internal Security</option>
                      <option value="ethics">Ethics</option>
                      <option value="csat">CSAT</option>
                      <option value="current">Current Affairs</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={styles.label}>Year</label>
                    <input
                      type="text"
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, year: e.target.value }))}
                      style={styles.input}
                      placeholder="e.g., 2023"
                    />
                  </div>
                  <div>
                    <label style={styles.label}>PDF File *</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files[0] }))}
                      style={styles.input}
                      required={!editingPyq}
                    />
                  </div>
                </div>
                <div>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
                    placeholder="Brief description of this PYQ paper..."
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={styles.primaryBtn} disabled={uploading}>
                  {uploading ? '⏳ Uploading...' : (editingPyq ? 'Update PYQ' : 'Upload PYQ')}
                </button>
                <button type="button" onClick={resetForm} style={styles.secondaryBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PYQs List */}
        {pyqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3>No PYQs yet</h3>
            <p>Upload your first Previous Year Question paper</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {pyqs.map((pyq) => (
              <div key={pyq.id} style={styles.subjectCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{pyq.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {pyq.examType?.toUpperCase()} {pyq.paper && `• ${pyq.paper.toUpperCase()}`} {pyq.subject && `• ${pyq.subject.charAt(0).toUpperCase() + pyq.subject.slice(1)}`} {pyq.year && `• ${pyq.year}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => editPyq(pyq)}
                      style={{ ...styles.secondaryBtn, padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                      disabled={uploading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deletePyq(pyq.id, pyq.storagePath)}
                      style={styles.deleteBtn}
                      disabled={uploading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {pyq.description && (
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                    {pyq.description}
                  </p>
                )}

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                  📄 {pyq.fileName} • {(pyq.fileSize / (1024 * 1024)).toFixed(2)} MB
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={pyq.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...styles.secondaryBtn, padding: '0.5rem 1rem', textDecoration: 'none', display: 'inline-block' }}
                  >
                    📥 Download
                  </a>
                  <a
                    href={pyq.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...styles.secondaryBtn, padding: '0.5rem 1rem', textDecoration: 'none', display: 'inline-block' }}
                  >
                    👁️ View
                  </a>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
                  Uploaded: {pyq.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </div>
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' },
  subjectCard: { backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  deleteBtn: { padding: '0.25rem 0.75rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  loadingBox: { backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
};

export default AdminPYQ;