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
import AdminLayout from "@/layouts/AdminLayout";

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

const COLLECTION_COLORS = [
  '#7C5CFC', '#4A79E8', '#3EAE5F', '#F0A23A', '#E3564F', '#E0559B', '#2AA893', '#8A5CD6',
];

const inputCls =
  "w-full rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-primary)]";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`card fade-up max-h-[90vh] w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-y-auto`}>
        <div className="hairline-b flex items-center justify-between bg-[var(--color-surface-alt)] px-5 py-3.5">
          <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h5>
          <button
            type="button"
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// Icon tile that matches the student Study Notes page look — soft tint bg + colored icon/emoji
function IconTile({ color = '#3b82f6', icon = '📚', size = 44, radius = 12 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius,
        background: `${color}1a`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: size * 0.42,
      }}
    >
      {icon}
    </div>
  );
}

export default function AdminNotes() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('subjects'); // subjects | pdfs | collections

  // Form states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', color: '#3b82f6', icon: '📚', order: 0 });
  const [pdfForm, setPdfForm] = useState({ title: '', description: '', url: '', pages: '', subjectId: '', file: null });
  const [collectionForm, setCollectionForm] = useState({
    name: '', description: '', count: '', color: COLLECTION_COLORS[0],
    order: 0, imageUrl: '', imageFile: null,
  });
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

  /* ── Load Top Collections ── */
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(
      query(collection(db, "noteCollections"), orderBy("order", "asc")),
      snap => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCollections(list);
      },
      () => setCollections([]) // in case the collection/index doesn't exist yet
    );
    return () => unsub();
  }, [isAdmin]);

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
      await addDoc(collection(db, "pdfs"), pdfData);

      const subjectDoc = await getDoc(doc(db, "pdfSubjects", pdfForm.subjectId));
      if (subjectDoc.exists()) {
        await updateDoc(doc(db, "pdfSubjects", pdfForm.subjectId), {
          pdfCount: (subjectDoc.data().pdfCount || 0) + 1
        });
      }

      toast.success("PDF added successfully!");
      setShowPdfModal(false);
      setPdfForm({ title: '', description: '', url: '', pages: '', subjectId: '', file: null });
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

  /* ── Create collection (Top Collections) ── */
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!collectionForm.name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = collectionForm.imageUrl || "";

      if (collectionForm.imageFile) {
        toast.info("Uploading image...");
        const storageRef = ref(storage, `collections/${Date.now()}_${collectionForm.imageFile.name}`);
        await uploadBytes(storageRef, collectionForm.imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "noteCollections"), {
        name: collectionForm.name,
        description: collectionForm.description,
        count: parseInt(collectionForm.count) || 0,
        color: collectionForm.color,
        order: parseInt(collectionForm.order) || 0,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      toast.success("Collection created successfully!");
      setShowCollectionModal(false);
      setCollectionForm({ name: '', description: '', count: '', color: COLLECTION_COLORS[0], order: 0, imageUrl: '', imageFile: null });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to create collection: ${err?.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete collection ── */
  const handleDeleteCollection = async (collectionId) => {
    if (!confirm("Delete this collection?")) return;
    try {
      await deleteDoc(doc(db, "noteCollections", collectionId));
      toast.success("Collection deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete collection");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <AdminLayout
      title="Notes & PDFs"
      subtitle="Subjects, PDFs and Top Collections shown on the student desk."
    >
      <div>

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            className={activeTab === 'subjects' ? "chip chip-ink" : "chip"}
            onClick={() => setActiveTab('subjects')}
          >
            📚 Subjects ({subjects.length})
          </button>
          <button
            className={activeTab === 'pdfs' ? "chip chip-ink" : "chip"}
            onClick={() => setActiveTab('pdfs')}
          >
            📄 PDFs
          </button>
          <button
            className={activeTab === 'collections' ? "chip chip-ink" : "chip"}
            onClick={() => setActiveTab('collections')}
          >
            ✨ Top Collections ({collections.length})
          </button>
        </div>

        {/* Subjects Tab — icon-tile grid, matching student Study Notes page */}
        {activeTab === 'subjects' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">All subjects</h5>
              <button className="btn btn-primary" onClick={() => setShowSubjectModal(true)}>+ Add subject</button>
            </div>

            {subjects.length === 0 ? (
              <div className="card p-12 text-center text-[var(--color-ink-muted)]">
                No subjects found. Create one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {subjects.map((sub) => (
                  <div key={sub.id} className="card card-hover relative flex items-center gap-3 p-4">
                    <IconTile color={sub.color || '#3b82f6'} icon={sub.icon || '📚'} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">{sub.name}</div>
                      <div className="text-[12px] text-[var(--color-ink-muted)]">{sub.pdfCount || 0} Notes · #{sub.order || 0}</div>
                    </div>
                    <button
                      className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-accent-tint)] hover:text-[var(--color-accent-hover)]"
                      onClick={() => handleDeleteSubject(sub.id)}
                      title="Delete subject"
                      aria-label="Delete subject"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDFs Tab */}
        {activeTab === 'pdfs' && (
          <div className="card overflow-hidden">
            <div className="hairline-b flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div>
                <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">PDFs</h5>
                {selectedSubject && (
                  <div className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">
                    Showing PDFs for: {subjects.find(s => s.id === selectedSubject)?.name}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  className={`${inputCls} w-auto`}
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value || null)}
                >
                  <option value="">All subjects</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={() => setShowPdfModal(true)} disabled={subjects.length === 0}>
                  + Add PDF
                </button>
              </div>
            </div>

            {subjects.length === 0 ? (
              <div className="p-12 text-center text-[var(--color-ink-muted)]">
                Please create subjects first before adding PDFs.
              </div>
            ) : pdfs.length === 0 ? (
              <div className="p-12 text-center text-[var(--color-ink-muted)]">
                {selectedSubject ? "No PDFs in this subject." : "Select a subject to view PDFs."}
              </div>
            ) : (
              <div>
                {pdfs.map((pdf, i) => (
                  <div
                    key={pdf.id}
                    className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${i !== pdfs.length - 1 ? "hairline-b" : ""}`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <IconTile color="#dc3545" icon="📄" size={36} radius={9} />
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">{pdf.title}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-ink-muted)]">
                          <span>{subjects.find(s => s.id === pdf.subjectId)?.name || 'N/A'}</span>
                          {pdf.pages && <span>· {pdf.pages} pages</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !px-3 !py-1.5 text-[13px]">
                        View
                      </a>
                      <button
                        className="btn !px-3 !py-1.5 text-[13px]"
                        style={{ background: "var(--color-accent-tint)", color: "var(--color-accent-hover)" }}
                        onClick={() => handleDeletePdf(pdf.id, pdf.subjectId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top Collections Tab — grid cards with bg image, matching student page's collection cards */}
        {activeTab === 'collections' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">Top Collections</h5>
                <div className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">
                  These are the featured collections shown on the student Study Notes page.
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setShowCollectionModal(true)}>+ Add collection</button>
            </div>

            {collections.length === 0 ? (
              <div className="card p-12 text-center text-[var(--color-ink-muted)]">
                No collections yet. Create one — e.g. &quot;NDA Complete Notes Collection&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {collections.map((c) => (
                  <div key={c.id} className="card card-hover relative overflow-hidden" style={{ minHeight: 190 }}>
                    {c.imageUrl ? (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${c.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)' }}
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0" style={{ background: `${c.color || '#4A79E8'}22` }} />
                    )}

                    <button
                      className="absolute right-2.5 top-2.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
                      onClick={() => handleDeleteCollection(c.id)}
                      title="Delete collection"
                      aria-label="Delete collection"
                    >
                      ✕
                    </button>

                    <div className="relative flex h-full flex-col justify-end p-5" style={{ minHeight: 190 }}>
                      <div
                        className="font-serif text-[16px] leading-snug"
                        style={{ color: c.imageUrl ? '#fff' : 'var(--color-ink)', letterSpacing: '-0.005em' }}
                      >
                        {c.name}
                      </div>
                      <div
                        className="mt-1 text-[12.5px]"
                        style={{ color: c.imageUrl ? 'rgba(255,255,255,0.85)' : (c.color || 'var(--color-ink-muted)') }}
                      >
                        {c.count || 0} Notes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Subject Modal */}
      {showSubjectModal && (
        <Modal title="Add subject" onClose={() => setShowSubjectModal(false)}>
          <form onSubmit={handleCreateSubject}>
            <div className="mb-4">
              <label className={labelCls}>Subject name</label>
              <input
                type="text" className={inputCls}
                value={subjectForm.name}
                onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Icon</label>
              <select
                className={inputCls}
                value={subjectForm.icon}
                onChange={e => setSubjectForm({ ...subjectForm, icon: e.target.value })}
              >
                {SUBJECT_COLORS.map(c => (
                  <option key={c.icon} value={c.icon}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1">
                <label className={labelCls}>Color</label>
                <input
                  type="color"
                  className="h-10 w-full cursor-pointer rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
                  value={subjectForm.color}
                  onChange={e => setSubjectForm({ ...subjectForm, color: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Order</label>
                <input
                  type="number" className={inputCls}
                  value={subjectForm.order}
                  onChange={e => setSubjectForm({ ...subjectForm, order: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-[12px] border border-[var(--color-border)] p-3">
              <IconTile color={subjectForm.color} icon={subjectForm.icon} />
              <div className="text-[13px] text-[var(--color-ink-muted)]">Live preview</div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Creating…' : 'Create subject'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowSubjectModal(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <Modal
          title="Add PDF"
          wide
          onClose={() => { setShowPdfModal(false); setPdfForm({ title: '', description: '', url: '', pages: '', subjectId: '', file: null }); }}
        >
          <form onSubmit={handleCreatePdf}>
            <div className="mb-4">
              <label className={labelCls}>Subject</label>
              <select
                className={inputCls}
                value={pdfForm.subjectId}
                onChange={e => setPdfForm({ ...pdfForm, subjectId: e.target.value })}
                required
              >
                <option value="">Select subject</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Title</label>
              <input
                type="text" className={inputCls}
                value={pdfForm.title}
                onChange={e => setPdfForm({ ...pdfForm, title: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Description</label>
              <textarea
                className={inputCls} rows="2"
                value={pdfForm.description}
                onChange={e => setPdfForm({ ...pdfForm, description: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Upload PDF file</label>
              <input
                type="file"
                className={`${inputCls} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--color-primary-tint)] file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-[var(--color-primary)]`}
                accept=".pdf"
                onChange={e => setPdfForm({ ...pdfForm, file: e.target.files[0] || null })}
              />
              <div className="mt-1 text-[12px] text-[var(--color-ink-faint)]">Or enter a URL below</div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>PDF URL <span className="font-normal text-[var(--color-ink-faint)]">(optional — if not uploading a file)</span></label>
              <input
                type="url" className={inputCls}
                value={pdfForm.url}
                onChange={e => setPdfForm({ ...pdfForm, url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Number of pages <span className="font-normal text-[var(--color-ink-faint)]">(optional)</span></label>
              <input
                type="number" className={inputCls}
                value={pdfForm.pages}
                onChange={e => setPdfForm({ ...pdfForm, pages: e.target.value })}
              />
            </div>
            {pdfForm.file && (
              <div className="mb-4 rounded-[12px] border border-[rgba(37,99,235,0.22)] bg-[var(--cat-blue-t)] px-3.5 py-2.5 text-[13px] text-[var(--cat-blue)]">
                📄 Selected file: <strong>{pdfForm.file.name}</strong> ({(pdfForm.file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Add PDF'}
              </button>
              <button
                type="button" className="btn btn-ghost"
                onClick={() => { setShowPdfModal(false); setPdfForm({ title: '', description: '', url: '', pages: '', subjectId: '', file: null }); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Collection Modal */}
      {showCollectionModal && (
        <Modal
          title="Add collection"
          wide
          onClose={() => { setShowCollectionModal(false); setCollectionForm({ name: '', description: '', count: '', color: COLLECTION_COLORS[0], order: 0, imageUrl: '', imageFile: null }); }}
        >
          <form onSubmit={handleCreateCollection}>
            <div className="mb-4">
              <label className={labelCls}>Collection name</label>
              <input
                type="text" className={inputCls}
                placeholder="e.g. NDA Complete Notes Collection"
                value={collectionForm.name}
                onChange={e => setCollectionForm({ ...collectionForm, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Description <span className="font-normal text-[var(--color-ink-faint)]">(optional)</span></label>
              <textarea
                className={inputCls} rows="2"
                value={collectionForm.description}
                onChange={e => setCollectionForm({ ...collectionForm, description: e.target.value })}
              />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1">
                <label className={labelCls}>Notes count</label>
                <input
                  type="number" className={inputCls}
                  value={collectionForm.count}
                  onChange={e => setCollectionForm({ ...collectionForm, count: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className={labelCls}>Order</label>
                <input
                  type="number" className={inputCls}
                  value={collectionForm.order}
                  onChange={e => setCollectionForm({ ...collectionForm, order: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelCls}>Accent color <span className="font-normal text-[var(--color-ink-faint)]">(used if no background image)</span></label>
              <div className="flex flex-wrap gap-2">
                {COLLECTION_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCollectionForm({ ...collectionForm, color: c })}
                    className="h-8 w-8 rounded-full transition-transform"
                    style={{
                      background: c,
                      boxShadow: collectionForm.color === c ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${c}` : 'none',
                    }}
                    aria-label={`Choose ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className={labelCls}>Background image — upload a file</label>
              <input
                type="file"
                accept="image/*"
                className={`${inputCls} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--color-primary-tint)] file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-[var(--color-primary)]`}
                onChange={e => setCollectionForm({ ...collectionForm, imageFile: e.target.files[0] || null, imageUrl: '' })}
              />
              <div className="mt-1 text-[12px] text-[var(--color-ink-faint)]">Or paste an image link below</div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Background image — URL <span className="font-normal text-[var(--color-ink-faint)]">(optional — if not uploading a file)</span></label>
              <input
                type="url" className={inputCls}
                placeholder="https://…"
                value={collectionForm.imageUrl}
                onChange={e => setCollectionForm({ ...collectionForm, imageUrl: e.target.value, imageFile: null })}
              />
            </div>

            {/* Live preview */}
            <div className="mb-4 overflow-hidden rounded-[14px] border border-[var(--color-border)]" style={{ minHeight: 140, position: 'relative' }}>
              {collectionForm.imageFile ? (
                <img
                  src={URL.createObjectURL(collectionForm.imageFile)}
                  alt="Preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : collectionForm.imageUrl ? (
                <img
                  src={collectionForm.imageUrl}
                  alt="Preview"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="absolute inset-0" style={{ background: `${collectionForm.color}22` }} />
              )}
              <div className="absolute inset-0" style={{ background: (collectionForm.imageFile || collectionForm.imageUrl) ? 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%)' : 'none' }} />
              <div className="absolute bottom-0 left-0 p-4">
                <div
                  className="font-serif text-[15px]"
                  style={{ color: (collectionForm.imageFile || collectionForm.imageUrl) ? '#fff' : 'var(--color-ink)' }}
                >
                  {collectionForm.name || 'Collection name'}
                </div>
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: (collectionForm.imageFile || collectionForm.imageUrl) ? 'rgba(255,255,255,0.85)' : collectionForm.color }}
                >
                  {collectionForm.count || 0} Notes
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? 'Creating…' : 'Create collection'}
              </button>
              <button
                type="button" className="btn btn-ghost"
                onClick={() => { setShowCollectionModal(false); setCollectionForm({ name: '', description: '', count: '', color: COLLECTION_COLORS[0], order: 0, imageUrl: '', imageFile: null }); }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      </div>
    </AdminLayout>
  );
}