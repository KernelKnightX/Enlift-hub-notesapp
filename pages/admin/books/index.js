import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { db, storage } from "../../../firebase/config";
import {
  collection, query, where, onSnapshot, doc, getDoc,
  addDoc, updateDoc, deleteDoc, serverTimestamp, orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";

const inputCls =
  "w-full rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-primary)]";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`card fade-up max-h-[90vh] w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-y-auto`}>
        <div className="hairline-b flex items-center justify-between bg-[var(--color-surface-alt)] px-5 py-3.5">
          <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h5>
          <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]" aria-label="Close">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function AdminBooks() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(null);

  const [bookSubjects, setBookSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', order: 0 });
  const [bookForm, setBookForm] = useState({ title: '', description: '', url: '', coverFile: null, coverUrl: '', pages: '', subjectId: '', language: 'English', difficulty: 'Intermediate' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists() || !snap.data()?.isAdmin) {
          toast.error('Admin access required.');
          if (!cancelled) router.replace('/');
          return;
        }
        if (!cancelled) setIsAdmin(true);
      } catch (err) {
        console.error(err);
        if (!cancelled) router.replace('/');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(
      query(collection(db, 'bookSubjects'), orderBy('order', 'asc')),
      snap => setBookSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      () => {}
    );
    return () => unsub();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedSubject) { setBooks([]); return; }
    const unsub = onSnapshot(
      query(collection(db, 'books'), where('subjectId', '==', selectedSubject), orderBy('createdAt', 'desc')),
      snap => setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      () => {}
    );
    return () => unsub();
  }, [isAdmin, selectedSubject]);

  const handleLogout = async () => {
    try { await logout(); router.push('/login'); } catch (err) { console.error(err); }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) { toast.error('Subject name is required.'); return; }
    setUploading(true);
    try {
      await addDoc(collection(db, 'bookSubjects'), {
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim(),
        order: Number(subjectForm.order) || 0,
        pdfCount: 0,
        createdAt: serverTimestamp(),
      });
      toast.success('Book subject created.');
      setShowSubjectModal(false);
      setSubjectForm({ name: '', description: '', order: 0 });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create subject.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.subjectId) {
      toast.error('Title and subject are required.');
      return;
    }

    setUploading(true);
    try {
      let coverUrl = bookForm.coverUrl;
      if (bookForm.coverFile) {
        const storageRef = ref(storage, `book-covers/${Date.now()}_${bookForm.coverFile.name}`);
        await uploadBytes(storageRef, bookForm.coverFile);
        coverUrl = await getDownloadURL(storageRef);
      }

      const bookData = {
        title: bookForm.title.trim(),
        description: bookForm.description.trim() || bookForm.title.trim(),
        url: bookForm.url.trim(),
        coverUrl: coverUrl || '',
        pages: Number(bookForm.pages) || null,
        subjectId: bookForm.subjectId,
        language: bookForm.language,
        difficulty: bookForm.difficulty,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'books'), bookData);

      const subjectRef = doc(db, 'bookSubjects', bookForm.subjectId);
      const subjectSnap = await getDoc(subjectRef);
      if (subjectSnap.exists()) {
        await updateDoc(subjectRef, { pdfCount: (subjectSnap.data().pdfCount || 0) + 1 });
      }

      toast.success('Book created.');
      setShowBookModal(false);
      setBookForm({ title: '', description: '', url: '', coverFile: null, coverUrl: '', pages: '', subjectId: '', language: 'English', difficulty: 'Intermediate' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create book.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Delete this book?')) return;
    try {
      await deleteDoc(doc(db, 'books', bookId));
      toast.success('Book deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete book.');
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-ink)]">
      <div className="max-w-[1200px] mx-auto p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Books Library Admin</h1>
            <p className="text-sm text-[var(--color-ink-muted)]">Manage public UPSC book subjects, listings, and cover images.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => setShowSubjectModal(true)}>Add subject</button>
            <button className="btn btn-secondary" disabled={!bookSubjects.length} onClick={() => setShowBookModal(true)}>Add book</button>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Book subjects</h2>
                <span className="text-xs text-[var(--color-ink-muted)]">{bookSubjects.length}</span>
              </div>
              <div className="space-y-3">
                {bookSubjects.map((subject) => (
                  <button key={subject.id} className={`w-full rounded-2xl border px-4 py-3 text-left ${selectedSubject === subject.id ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'}`} onClick={() => setSelectedSubject(subject.id)}>
                    <div className="font-semibold">{subject.name}</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">{subject.description || 'No description yet.'}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Books</h2>
                  <p className="text-sm text-[var(--color-ink-muted)]">{selectedSubject ? `Showing books for ${bookSubjects.find(s => s.id === selectedSubject)?.name}` : 'Select a subject to view books.'}</p>
                </div>
                <span className="text-xs text-[var(--color-ink-muted)]">{books.length} items</span>
              </div>
              {selectedSubject ? (
                <div className="space-y-3">
                  {books.map((book) => (
                    <div key={book.id} className="flex flex-col gap-3 rounded-3xl border border-[var(--color-border)] p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-semibold">{book.title}</div>
                        <div className="text-xs text-[var(--color-ink-muted)]">{book.description}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[13px] text-[var(--color-ink-muted)]">
                          <span>{book.language}</span>
                          <span>{book.difficulty}</span>
                          {book.pages ? <span>{book.pages} pages</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link href={book.url || '#'} className="btn btn-ghost" target="_blank">Open</Link>
                        <button className="btn btn-danger" onClick={() => handleDeleteBook(book.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[var(--color-border)] p-8 text-center text-[var(--color-ink-muted)]">Choose a subject to see books here.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSubjectModal && (
        <Modal title="Add Book Subject" onClose={() => setShowSubjectModal(false)}>
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className={labelCls}>Subject name</label>
              <input type="text" className={inputCls} value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows="3" value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Sort order</label>
              <input type="number" className={inputCls} value={subjectForm.order} onChange={e => setSubjectForm({ ...subjectForm, order: Number(e.target.value) })} />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" className="btn btn-ghost" onClick={() => setShowSubjectModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Saving…' : 'Save subject'}</button>
            </div>
          </form>
        </Modal>
      )}

      {showBookModal && (
        <Modal title="Add Book" wide onClose={() => setShowBookModal(false)}>
          <form onSubmit={handleCreateBook} className="space-y-4">
            <div>
              <label className={labelCls}>Subject</label>
              <select className={inputCls} value={bookForm.subjectId} onChange={e => setBookForm({ ...bookForm, subjectId: e.target.value })} required>
                <option value="">Select subject</option>
                {bookSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input type="text" className={inputCls} value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows="3" value={bookForm.description} onChange={e => setBookForm({ ...bookForm, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Cover image</label>
              <input type="file" accept="image/*" className={`${inputCls} cursor-pointer`} onChange={e => setBookForm({ ...bookForm, coverFile: e.target.files[0] || null })} />
              <div className="text-xs text-[var(--color-ink-muted)] mt-2">Optional cover image for the public books library.</div>
            </div>
            <div>
              <label className={labelCls}>PDF URL</label>
              <input type="url" className={inputCls} value={bookForm.url} onChange={e => setBookForm({ ...bookForm, url: e.target.value })} required />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className={labelCls}>Language</label>
                <select className={inputCls} value={bookForm.language} onChange={e => setBookForm({ ...bookForm, language: e.target.value })}>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Difficulty</label>
                <select className={inputCls} value={bookForm.difficulty} onChange={e => setBookForm({ ...bookForm, difficulty: e.target.value })}>
                  <option>Intermediate</option>
                  <option>Beginner</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Pages</label>
              <input type="number" className={inputCls} value={bookForm.pages} onChange={e => setBookForm({ ...bookForm, pages: e.target.value })} />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" className="btn btn-ghost" onClick={() => setShowBookModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Saving…' : 'Save book'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
