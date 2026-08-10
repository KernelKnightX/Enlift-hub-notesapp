import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '@/firebase/config';
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

  // Check admin access
  const checkAdmin = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() && userDoc.data().isAdmin === true;
    } catch (err) {
      console.error('Admin check error:', err);
      return false;
    }
  };

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

  const handleLogout = () => signOut(auth);

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

  const uploadPyq = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim() || !uploadForm.examType || !uploadForm.file) {
      alert('Please fill all required fields and select a PDF file.');
      return;
    }

    setUploading(true);
    try {
      const fileRef = ref(storage, `pyqs/${Date.now()}_${uploadForm.file.name}`);
      const snapshot = await uploadBytes(fileRef, uploadForm.file);
      const downloadURL = await getDownloadURL(snapshot.ref);

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

  const deletePyq = async (pyqId, storagePath) => {
    if (!window.confirm('Delete this PYQ? This action cannot be undone.')) return;
    setUploading(true);
    try {
      if (storagePath) {
        const fileRef = ref(storage, storagePath);
        await deleteObject(fileRef);
      }
      await deleteDoc(doc(db, 'pyqs', pyqId));
      await loadPyqs();
    } catch (err) {
      alert('Failed to delete PYQ');
      console.error(err);
    }
    setUploading(false);
  };

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

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition";
  const labelCls = "block mb-1.5 text-[13px] font-medium text-[var(--color-ink-muted)]";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] font-sans">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
          <p className="text-sm text-[var(--color-ink-muted)]">Loading…</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] dot-grid font-sans px-4">
        <div className="card w-full max-w-[400px] p-8 fade-up">
          <div className="text-center mb-7">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl grad-hero flex items-center justify-center text-white text-xl">🔐</div>
            <h1 className="hero-display text-2xl text-[var(--color-ink)]">Admin Login</h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">Sign in to manage PYQs</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
                placeholder="admin@example.com"
              />
            </div>

            <div className="mb-5">
              <label className={labelCls}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputCls}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/25 text-[var(--color-danger)] text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full justify-center">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const totalFiles = pyqs.reduce((acc, pyq) => acc + (pyq.fileSize ? 1 : 0), 0);
  const totalSize = (pyqs.reduce((acc, pyq) => acc + (pyq.fileSize || 0), 0) / (1024 * 1024)).toFixed(1);

  // Main Admin UI
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-sans">
      {/* Header */}
      <div className="hairline-b bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">Admin</p>
            <h1 className="hero-display text-2xl text-[var(--color-ink)]">📄 PYQ Management</h1>
            <p className="text-sm text-[var(--color-ink-muted)] mt-1">
              Upload and manage Previous Year Question papers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="chip">{user.email}</span>
            <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl chip-primary flex items-center justify-center text-xl">📄</div>
            <div>
              <div className="display-num text-2xl text-[var(--color-ink)]">{pyqs.length}</div>
              <div className="text-xs text-[var(--color-ink-muted)]">Total PYQs</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl chip-accent flex items-center justify-center text-xl">📁</div>
            <div>
              <div className="display-num text-2xl text-[var(--color-ink)]">{totalFiles}</div>
              <div className="text-xs text-[var(--color-ink-muted)]">Files Uploaded</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl chip-green flex items-center justify-center text-xl">📊</div>
            <div>
              <div className="display-num text-2xl text-[var(--color-success)]">{totalSize} MB</div>
              <div className="text-xs text-[var(--color-ink-muted)]">Total Size</div>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="card p-5 mb-5">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn btn-primary"
            disabled={uploading}
          >
            {showUploadForm ? 'Cancel Upload' : '+ Upload New PYQ'}
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="card p-6 mb-5 fade-up">
            <h3 className="font-serif text-lg text-[var(--color-ink)] mb-5">
              {editingPyq ? 'Edit PYQ' : 'Upload New PYQ'}
            </h3>

            <form onSubmit={uploadPyq}>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>PYQ Title *</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g., UPSC Prelims 2023 GS Paper I"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Exam Type *</label>
                    <select
                      value={uploadForm.examType}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, examType: e.target.value }))}
                      className={inputCls}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Paper *</label>
                    <select
                      value={uploadForm.paper}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, paper: e.target.value }))}
                      className={inputCls}
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
                    <label className={labelCls}>Subject *</label>
                    <select
                      value={uploadForm.subject}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                      className={inputCls}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>Year</label>
                    <input
                      type="text"
                      value={uploadForm.year}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, year: e.target.value }))}
                      className={inputCls}
                      placeholder="e.g., 2023"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>PDF File *</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files[0] }))}
                      className={inputCls}
                      required={!editingPyq}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    className={`${inputCls} min-h-[70px] resize-y`}
                    placeholder="Brief description of this PYQ paper..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? '⏳ Uploading...' : (editingPyq ? 'Update PYQ' : 'Upload PYQ')}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PYQs List */}
        {pyqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-serif text-lg text-[var(--color-ink)] mb-1">No PYQs yet</h3>
            <p className="text-sm text-[var(--color-ink-muted)]">Upload your first Previous Year Question paper</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pyqs.map((pyq) => (
              <div key={pyq.id} className="card card-hover p-5">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-serif text-base text-[var(--color-ink)]">{pyq.title}</h3>
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {pyq.examType && <span className="chip chip-primary">{pyq.examType.toUpperCase()}</span>}
                      {pyq.paper && <span className="chip chip-blue">{pyq.paper.toUpperCase()}</span>}
                      {pyq.subject && <span className="chip chip-violet">{pyq.subject.charAt(0).toUpperCase() + pyq.subject.slice(1)}</span>}
                      {pyq.year && <span className="chip">{pyq.year}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => editPyq(pyq)}
                      className="btn btn-ghost !px-3 !py-1.5 !text-xs"
                      disabled={uploading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deletePyq(pyq.id, pyq.storagePath)}
                      className="!px-3 !py-1.5 rounded-xl text-xs font-semibold text-[var(--color-danger)] border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/5 hover:bg-[var(--color-danger)]/10 transition"
                      disabled={uploading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {pyq.description && (
                  <p className="text-sm text-[var(--color-ink-muted)] mb-3 clamp-2">{pyq.description}</p>
                )}

                <div className="text-xs text-[var(--color-ink-faint)] mb-4">
                  📄 {pyq.fileName} • {(pyq.fileSize / (1024 * 1024)).toFixed(2)} MB
                </div>

                <div className="flex gap-2 mb-4">
                  <a
                    href={pyq.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost !text-xs"
                  >
                    📥 Download
                  </a>
                  <a
                    href={pyq.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost !text-xs"
                  >
                    👁️ View
                  </a>
                </div>

                <div className="text-xs text-[var(--color-ink-faint)] hairline-t pt-3">
                  Uploaded: {pyq.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-[var(--color-ink)]/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="card px-8 py-7 text-center">
            <div className="w-9 h-9 mx-auto mb-3 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)] animate-spin" />
            <p className="text-sm text-[var(--color-ink-muted)]">Processing…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPYQ;