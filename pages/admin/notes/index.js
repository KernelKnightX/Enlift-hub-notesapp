import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import { db, storage } from "../../../firebase/config";
import {
  collection, query, where, onSnapshot, doc, getDoc, 
  addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SUBJECT_COLORS = [
  { name: 'General Studies', color: '#6c757d', icon: '📚' },
  { name: 'Ancient & Medieval History', color: '#dc3545', icon: '🏛️' },
  { name: 'Modern History', color: '#fd7e14', icon: '⚔️' },
  { name: 'Geography', color: '#198754', icon: '🌍' },
  { name: 'Indian Economy', color: '#ffc107', icon: '💰' },
  { name: 'Indian Polity', color: '#0d6efd', icon: '🏛️' },
  { name: 'Environment & Ecology', color: '#20c997', icon: '🌱' },
  { name: 'Science & Technology', color: '#6f42c1', icon: '🔬' },
  { name: 'Current Affairs', color: '#d63384', icon: '📰' },
  { name: 'Ethics & Integrity', color: '#0caf0f', icon: '⚖️' },
  { name: 'International Relations', color: '#6610f2', icon: '🌐' },
  { name: 'Art & Culture', color: '#e83e8c', icon: '🎨' },
];

export default function AdminNotes() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [activeTab, setActiveTab] = useState('subjects'); // subjects | pdfs

  // Form states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', color: '#3b82f6', icon: '📚', order: 0 });
  const [pdfForm, setPdfForm] = useState({ title: '', description: '', url: '', pages: '', subjectId: '', file: null });
  const [uploading, setUploading] = useState(false);

  /* ── Auth + admin guard ── */
  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return; }
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists() || !snap.data().isAdmin) {
          toast.error("Admin access required.");
          if (!cancelled) router.replace("/");
          return;
        }
        if (!cancelled) { setProfile(snap.data()); setIsAdmin(true); }
      } catch (e) {
        console.error(e);
        if (!cancelled) router.replace("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, router]);

  /* ── Load subjects ── */
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(
      query(collection(db, "pdfSubjects"), orderBy("order", "asc")),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSubjects(list);
      }
    );
    return () => unsub();
  }, [isAdmin]);

  /* ── Load PDFs for selected subject ── */
  useEffect(() => {
    if (!isAdmin || !selectedSubject) {
      setPdfs([]);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, "pdfs"), where("subjectId", "==", selectedSubject), orderBy("createdAt", "desc")),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPdfs(list);
      }
    );
    return () => unsub();
  }, [isAdmin, selectedSubject]);

  const handleLogout = async () => {
    try { await logout(); toast.success("Logged out!"); router.push("/login"); }
    catch { toast.error("Error logging out."); }
  };

  /* ── Create subject ── */
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    setUploading(true);
    try {
      await addDoc(collection(db, "pdfSubjects"), {
        ...subjectForm,
        order: parseInt(subjectForm.order) || 0,
        pdfCount: 0,
        createdAt: serverTimestamp()
      });
      toast.success("Subject created successfully!");
      setShowSubjectModal(false);
      setSubjectForm({ name: '', color: '#3b82f6', icon: '📚', order: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create subject");
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete subject ── */
  const handleDeleteSubject = async (subjectId) => {
    if (!confirm("Are you sure? This will also delete all PDFs in this subject.")) return;
    try {
      await deleteDoc(doc(db, "pdfSubjects", subjectId));
      toast.success("Subject deleted");
      if (selectedSubject === subjectId) setSelectedSubject(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete subject");
    }
  };

  /* ── Create PDF ── */
  const handleCreatePdf = async (e) => {
    e.preventDefault();
    
    // Check if file is selected or URL is provided
    if (!pdfForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!pdfForm.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!pdfForm.file && !pdfForm.url) {
      toast.error("Please select a PDF file or enter a URL");
      return;
    }
    
    setUploading(true);
    try {
      let pdfUrl = pdfForm.url;
      
      // If file is selected, upload to Firebase Storage
      if (pdfForm.file) {
        toast.info("Uploading PDF file...");
        const storageRef = ref(storage, `pdfs/${Date.now()}_${pdfForm.file.name}`);
        await uploadBytes(storageRef, pdfForm.file);
        pdfUrl = await getDownloadURL(storageRef);
        toast.info("PDF uploaded successfully!");
      }
      
      const pdfData = {
        title: pdfForm.title,
        description: pdfForm.description || pdfForm.title,
        url: pdfUrl,
        subjectId: pdfForm.subjectId,
        pages: parseInt(pdfForm.pages) || null,
        createdAt: serverTimestamp()
      };
      const pdfRef = await addDoc(collection(db, "pdfs"), pdfData);
      
      // Update subject pdfCount
      const subjectDoc = await getDoc(doc(db, "pdfSubjects", pdfForm.subjectId));
      if (subjectDoc.exists()) {
        await updateDoc(doc(db, "pdfSubjects", pdfForm.subjectId), {
          pdfCount: (subjectDoc.data().pdfCount || 0) + 1
        });
      }
      
      toast.success("PDF added successfully!");
      setShowPdfModal(false);
      setPdfForm({ title: '', description: '', url: '', pages: '', subjectId: '' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add PDF");
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete PDF ── */
  const handleDeletePdf = async (pdfId, subjectId) => {
    if (!confirm("Are you sure you want to delete this PDF?")) return;
    try {
      await deleteDoc(doc(db, "pdfs", pdfId));
      
      // Update subject pdfCount
      const subjectDoc = await getDoc(doc(db, "pdfSubjects", subjectId));
      if (subjectDoc.exists()) {
        await updateDoc(doc(db, "pdfSubjects", subjectId), {
          pdfCount: Math.max(0, (subjectDoc.data().pdfCount || 1) - 1)
        });
      }
      
      toast.success("PDF deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete PDF");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f4f8" }}>
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }} />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh" }}>

      {/* Header */}
      <div
        className="px-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)", boxShadow: "0 2px 12px rgba(30,58,95,.3)" }}
      >
        <div>
          <h1 className="h5 fw-bold mb-1 text-white">📝 Notes Management</h1>
          <div className="small" style={{ color: "rgba(255,255,255,.7)" }}>
            Manage study notes subjects and PDFs
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href="/admin" className="btn btn-sm" style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}>← Back</Link>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="container-fluid px-3 px-md-4 py-4">

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4">
          <button
            className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('subjects')}
          >
            📚 Subjects ({subjects.length})
          </button>
          <button
            className={`btn ${activeTab === 'pdfs' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('pdfs')}
          >
            📄 PDFs
          </button>
        </div>

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Subjects</h5>
              <button className="btn btn-sm btn-primary" onClick={() => setShowSubjectModal(true)}>+ Add Subject</button>
            </div>
            <div className="card-body p-0">
              {subjects.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>No subjects found. Create one to get started!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order</th>
                        <th>Icon</th>
                        <th>Name</th>
                        <th>PDFs</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map(sub => (
                        <tr key={sub.id}>
                          <td>{sub.order || 0}</td>
                          <td style={{ fontSize: '1.5rem' }}>{sub.icon || '📚'}</td>
                          <td>
                            <span className="badge" style={{ backgroundColor: sub.color || '#3b82f6' }}>
                              {sub.name}
                            </span>
                          </td>
                          <td>{sub.pdfCount || 0}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteSubject(sub.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDFs Tab */}
        {activeTab === 'pdfs' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="mb-0">PDFs</h5>
                {selectedSubject && <small className="text-muted">Showing PDFs for: {subjects.find(s => s.id === selectedSubject)?.name}</small>}
              </div>
              <div className="d-flex gap-2">
                <select 
                  className="form-select form-select-sm" 
                  style={{ width: 'auto' }}
                  value={selectedSubject || ''} 
                  onChange={(e) => setSelectedSubject(e.target.value || null)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => setShowPdfModal(true)} disabled={subjects.length === 0}>+ Add PDF</button>
              </div>
            </div>
            <div className="card-body p-0">
              {subjects.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>Please create subjects first before adding PDFs.</p>
                </div>
              ) : pdfs.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>{selectedSubject ? "No PDFs in this subject." : "Select a subject to view PDFs."}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Subject</th>
                        <th>Pages</th>
                        <th>URL</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pdfs.map(pdf => (
                        <tr key={pdf.id}>
                          <td>{pdf.title}</td>
                          <td>{subjects.find(s => s.id === pdf.subjectId)?.name || 'N/A'}</td>
                          <td>{pdf.pages || '-'}</td>
                          <td>
                            <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary">View</a>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePdf(pdf.id, pdf.subjectId)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Subject Modal */}
      {showSubjectModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Subject</h5>
                <button type="button" className="btn-close" onClick={() => setShowSubjectModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSubject}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Subject Name</label>
                    <input type="text" className="form-control" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Icon</label>
                    <select className="form-select" value={subjectForm.icon} onChange={e => setSubjectForm({...subjectForm, icon: e.target.value})}>
                      {SUBJECT_COLORS.map(c => (
                        <option key={c.icon} value={c.icon}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input type="color" className="form-control form-control-color" value={subjectForm.color} onChange={e => setSubjectForm({...subjectForm, color: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Order</label>
                    <input type="number" className="form-control" value={subjectForm.order} onChange={e => setSubjectForm({...subjectForm, order: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Creating...' : 'Create Subject'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add PDF</h5>
                <button type="button" className="btn-close" onClick={() => { setShowPdfModal(false); setPdfForm({ title: '', description: '', url: '', pages: '', subjectId: '', file: null }); }}></button>
              </div>
              <form onSubmit={handleCreatePdf}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <select className="form-select" value={pdfForm.subjectId} onChange={e => setPdfForm({...pdfForm, subjectId: e.target.value})} required>
                      <option value="">Select Subject</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-control" value={pdfForm.title} onChange={e => setPdfForm({...pdfForm, title: e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="2" value={pdfForm.description} onChange={e => setPdfForm({...pdfForm, description: e.target.value})}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Upload PDF File</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept=".pdf"
                      onChange={e => setPdfForm({...pdfForm, file: e.target.files[0] || null })}
                    />
                    <small className="text-muted">Or enter URL below</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">PDF URL (optional - if not uploading file)</label>
                    <input type="url" className="form-control" value={pdfForm.url} onChange={e => setPdfForm({...pdfForm, url: e.target.value})} placeholder="https://..." />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Number of Pages (optional)</label>
                    <input type="number" className="form-control" value={pdfForm.pages} onChange={e => setPdfForm({...pdfForm, pages: e.target.value})} />
                  </div>
                  {pdfForm.file && (
                    <div className="alert alert-info">
                      📄 Selected file: <strong>{pdfForm.file.name}</strong> ({(pdfForm.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowPdfModal(false); setPdfForm({ title: '', description: '', url: '', pages: '', subjectId: '', file: null }); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Uploading...' : 'Add PDF'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
