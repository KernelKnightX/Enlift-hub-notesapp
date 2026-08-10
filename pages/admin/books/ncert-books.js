import { useEffect, useMemo, useState } from "react";
import { db } from "@/firebase/config";


import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const SUBJECTS = ["History", "Geography", "Polity", "Economy", "Science", "Society & Culture"];
const PRIORITIES = ["Essential", "Recommended", "Optional"];
const EDITIONS = ["old", "new"];
const GS_PAPERS = ["GS1", "GS2", "GS3", "GS4"];
const CLASS_OPTIONS = [6, 7, 8, 9, 10, 11, 12];

function emptyBook() {
  return {
    subject: "History",
    class: 9,
    title: "",
    desc: "",
    img: "",
    pdfUrl: "",
    edition: "new",
    priority: "Recommended",
    gsPaper: [],
    upscUse: "",
    order: 0,
  };
}

/* ================================================================
   ADMIN: NCERT BOOKS
   ================================================================ */

export default function AdminNcertBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyBook());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "ncertBooks"), orderBy("class"), orderBy("order"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load books.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (classFilter !== "all" && b.class !== Number(classFilter)) return false;
      if (subjectFilter !== "all" && b.subject !== subjectFilter) return false;
      if (searchTerm && !b.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [books, classFilter, subjectFilter, searchTerm]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyBook());
    setModalOpen(true);
  }

  function openEdit(book) {
    setEditingId(book.id);
    setForm({
      subject: book.subject || "History",
      class: book.class ?? 9,
      title: book.title || "",
      desc: book.desc || "",
      img: book.img || "",
      pdfUrl: book.pdfUrl || "",
      edition: book.edition || "new",
      priority: book.priority || "Recommended",
      gsPaper: book.gsPaper || [],
      upscUse: book.upscUse || "",
      order: book.order ?? 0,
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
  }

  function toggleGsPaper(paper) {
    setForm((f) => ({
      ...f,
      gsPaper: f.gsPaper.includes(paper)
        ? f.gsPaper.filter((p) => p !== paper)
        : [...f.gsPaper, paper],
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        class: Number(form.class),
        order: Number(form.order) || 0,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "ncertBooks", editingId), payload);
      } else {
        await addDoc(collection(db, "ncertBooks"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to save book.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "ncertBooks", deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Failed to delete book.");
    }
  }

  return (
    <div className="admin-ncert-page">
      <header className="admin-ncert-header">
        <div>
          <span className="admin-ncert-eyebrow">CONTENT · NCERT LIBRARY</span>
          <h1>NCERT Books</h1>
          <p>Manage the class-wise NCERT book library shown on the public page.</p>
        </div>

        <button type="button" className="admin-btn-primary" onClick={openCreate}>
          + Add Book
        </button>
      </header>

      {error && (
        <div className="admin-ncert-error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="admin-ncert-toolbar">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-ncert-search"
        />

        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="all">All classes</option>
          {CLASS_OPTIONS.map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>

        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="all">All subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-ncert-empty">Loading books…</div>
      ) : filteredBooks.length === 0 ? (
        <div className="admin-ncert-empty">
          <p>No books match these filters.</p>
          <button type="button" className="admin-btn-secondary" onClick={openCreate}>
            Add the first one
          </button>
        </div>
      ) : (
        <div className="admin-ncert-table-wrap">
          <table className="admin-ncert-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>PDF</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    {book.img ? (
                      <img src={book.img} alt="" className="admin-ncert-thumb" />
                    ) : (
                      <div className="admin-ncert-thumb admin-ncert-thumb-empty" />
                    )}
                  </td>
                  <td>
                    <span className="admin-ncert-title-cell">{book.title}</span>
                    {book.edition && (
                      <span className="admin-ncert-edition-tag">{book.edition} edition</span>
                    )}
                  </td>
                  <td>{book.class}</td>
                  <td>{book.subject}</td>
                  <td>
                    <span className={`admin-priority-badge admin-priority-${(book.priority || "").toLowerCase()}`}>
                      {book.priority}
                    </span>
                  </td>
                  <td>
                    {book.pdfUrl ? (
                      <span className="admin-ncert-pdf-ok">✓ Linked</span>
                    ) : (
                      <span className="admin-ncert-pdf-missing">Missing</span>
                    )}
                  </td>
                  <td className="admin-ncert-actions">
                    <button type="button" onClick={() => openEdit(book)}>Edit</button>
                    <button
                      type="button"
                      className="admin-ncert-delete-btn"
                      onClick={() => setDeleteTarget(book)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="admin-ncert-modal-backdrop" onClick={closeModal}>
          <div className="admin-ncert-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Edit Book" : "Add Book"}</h2>

            <form onSubmit={handleSave} className="admin-ncert-form">
              <label>
                Title
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>

              <label>
                Description
                <textarea
                  rows={2}
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                />
              </label>

              <div className="admin-ncert-form-row">
                <label>
                  Class
                  <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })}>
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Subject
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-ncert-form-row">
                <label>
                  Priority
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Edition
                  <select value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })}>
                    {EDITIONS.map((ed) => (
                      <option key={ed} value={ed}>{ed === "old" ? "Old NCERT" : "New NCERT"}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                GS Paper relevance
                <div className="admin-ncert-checkbox-row">
                  {GS_PAPERS.map((paper) => (
                    <label key={paper} className="admin-ncert-checkbox">
                      <input
                        type="checkbox"
                        checked={form.gsPaper.includes(paper)}
                        onChange={() => toggleGsPaper(paper)}
                      />
                      {paper}
                    </label>
                  ))}
                </div>
              </label>

              <label>
                UPSC use (short tag)
                <input
                  type="text"
                  placeholder="e.g. Modern History Foundation"
                  value={form.upscUse}
                  onChange={(e) => setForm({ ...form, upscUse: e.target.value })}
                />
              </label>

              <label>
                Cover image URL
                <input
                  type="url"
                  value={form.img}
                  onChange={(e) => setForm({ ...form, img: e.target.value })}
                />
              </label>

              <label>
                PDF URL (leave blank if unavailable)
                <input
                  type="url"
                  value={form.pdfUrl}
                  onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                />
              </label>

              <label>
                Display order (within class)
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </label>

              <div className="admin-ncert-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-ncert-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="admin-ncert-modal admin-ncert-modal-small" onClick={(e) => e.stopPropagation()}>
            <h2>Delete this book?</h2>
            <p>
              "{deleteTarget.title}" will be removed from the public NCERT page immediately.
              This can't be undone.
            </p>
            <div className="admin-ncert-modal-actions">
              <button type="button" className="admin-btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="admin-ncert-delete-btn-solid" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}