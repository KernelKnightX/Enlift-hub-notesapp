import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { db, storage } from "../../../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminLayout from "@/layouts/AdminLayout";

const inputCls =
  "w-full rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-primary)]";
const labelCls =
  "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`card fade-up max-h-[90vh] w-full ${wide ? "max-w-2xl" : "max-w-md"} overflow-y-auto`}
      >
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

function IconTile({ color = "#4f46e5", icon = "📖", size = 44, radius = 12 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: `${color}1a`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: size * 0.42,
      }}
    >
      {icon}
    </div>
  );
}

export default function AdminNotes2() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeTab, setActiveTab] = useState("subjects");
  const [uploading, setUploading] = useState(false);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    color: "violet",
    icon: "📖",
    order: 0,
  });
  const [chapterForm, setChapterForm] = useState({
    title: "",
    description: "",
    url: "",
    subjectId: "",
    file: null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
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
        if (!cancelled) setIsAdmin(true);
      } catch (e) {
        console.error(e);
        if (!cancelled) router.replace("/");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(
      query(collection(db, "htmlNoteSubjects"), orderBy("order", "asc")),
      (snap) => setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
    return () => unsub();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedSubject) {
      setChapters([]);
      return;
    }
    const unsub = onSnapshot(
      query(collection(db, "htmlChapters"), where("subjectId", "==", selectedSubject)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ms = (v) => (v?.toDate ? v.toDate().getTime() : 0);
            return ms(b.createdAt) - ms(a.createdAt);
          });
        setChapters(list);
      },
    );
    return () => unsub();
  }, [isAdmin, selectedSubject]);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      toast.error("Subject name is required");
      return;
    }
    setUploading(true);
    try {
      await addDoc(collection(db, "htmlNoteSubjects"), {
        ...subjectForm,
        order: parseInt(subjectForm.order, 10) || 0,
        chapterCount: 0,
        createdAt: serverTimestamp(),
      });
      toast.success("Subject created!");
      setShowSubjectModal(false);
      setSubjectForm({ name: "", color: "violet", icon: "📖", order: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create subject");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!confirm("Delete this subject? Chapters will remain in storage but won't show in the list.")) return;
    try {
      await deleteDoc(doc(db, "htmlNoteSubjects", subjectId));
      toast.success("Subject deleted");
      if (selectedSubject === subjectId) setSelectedSubject(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete subject");
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!chapterForm.subjectId) {
      toast.error("Please select a subject");
      return;
    }
    if (!chapterForm.file && !chapterForm.url) {
      toast.error("Upload an HTML file or paste a URL");
      return;
    }

    setUploading(true);
    try {
      let htmlUrl = chapterForm.url;

      if (chapterForm.file) {
        toast.info("Uploading HTML file...");
        const storageRef = ref(
          storage,
          `html-notes/${Date.now()}_${chapterForm.file.name}`,
        );
        await uploadBytes(storageRef, chapterForm.file, {
          contentType: "text/html",
        });
        htmlUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "htmlChapters"), {
        title: chapterForm.title,
        description: chapterForm.description || chapterForm.title,
        url: htmlUrl,
        subjectId: chapterForm.subjectId,
        type: "html",
        createdAt: serverTimestamp(),
      });

      const subjectDoc = await getDoc(doc(db, "htmlNoteSubjects", chapterForm.subjectId));
      if (subjectDoc.exists()) {
        await updateDoc(doc(db, "htmlNoteSubjects", chapterForm.subjectId), {
          chapterCount: (subjectDoc.data().chapterCount || 0) + 1,
        });
      }

      toast.success("HTML chapter added!");
      setShowChapterModal(false);
      setChapterForm({ title: "", description: "", url: "", subjectId: "", file: null });
    } catch (err) {
      console.error(err);
      if (err?.code === 'storage/unauthorized') {
        toast.error('Storage permission denied. Publish storage.rules in Firebase Console → Storage → Rules.');
      } else {
        toast.error(err?.message || 'Failed to add chapter');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteChapter = async (chapterId, subjectId) => {
    if (!confirm("Delete this HTML chapter?")) return;
    try {
      await deleteDoc(doc(db, "htmlChapters", chapterId));
      const subjectDoc = await getDoc(doc(db, "htmlNoteSubjects", subjectId));
      if (subjectDoc.exists()) {
        await updateDoc(doc(db, "htmlNoteSubjects", subjectId), {
          chapterCount: Math.max(0, (subjectDoc.data().chapterCount || 1) - 1),
        });
      }
      toast.success("Chapter deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete chapter");
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
      title="Study Notes"
      subtitle="Add subjects and chapter links (e.g. GitHub Pages URLs). Shown to students under Study Notes."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          className={activeTab === "subjects" ? "chip chip-ink" : "chip"}
          onClick={() => setActiveTab("subjects")}
        >
          📚 Subjects ({subjects.length})
        </button>
        <button
          type="button"
          className={activeTab === "chapters" ? "chip chip-ink" : "chip"}
          onClick={() => setActiveTab("chapters")}
        >
          📄 Chapters
        </button>
      </div>

      {activeTab === "subjects" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">All subjects</h5>
            <button type="button" className="btn btn-primary" onClick={() => setShowSubjectModal(true)}>
              + Add subject
            </button>
          </div>
          {subjects.length === 0 ? (
            <div className="card p-12 text-center text-[var(--color-ink-muted)]">
              No subjects yet. Create one (e.g. History), then add HTML chapters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {subjects.map((sub) => (
                <div key={sub.id} className="card card-hover relative flex items-center gap-3 p-4">
                  <IconTile color="#4f46e5" icon={sub.icon || "📖"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">{sub.name}</div>
                    <div className="text-[12px] text-[var(--color-ink-muted)]">
                      {sub.chapterCount || 0} chapters · #{sub.order || 0}
                    </div>
                  </div>
                  <button
                    type="button"
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

      {activeTab === "chapters" && (
        <div className="card overflow-hidden">
          <div className="hairline-b flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <div>
              <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">Chapters</h5>
              {selectedSubject && (
                <div className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">
                  Subject: {subjects.find((s) => s.id === selectedSubject)?.name}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className={`${inputCls} w-auto`}
                value={selectedSubject || ""}
                onChange={(e) => setSelectedSubject(e.target.value || null)}
              >
                <option value="">Select subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setChapterForm((f) => ({ ...f, subjectId: selectedSubject || "" }));
                  setShowChapterModal(true);
                }}
                disabled={subjects.length === 0}
              >
                + Add chapter
              </button>
            </div>
          </div>

          {subjects.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-ink-muted)]">Create a subject first.</div>
          ) : !selectedSubject ? (
            <div className="p-12 text-center text-[var(--color-ink-muted)]">Select a subject to view chapters.</div>
          ) : chapters.length === 0 ? (
            <div className="p-12 text-center text-[var(--color-ink-muted)]">No chapters in this subject yet.</div>
          ) : (
            <div>
              {chapters.map((ch, i) => (
                <div
                  key={ch.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${i !== chapters.length - 1 ? "hairline-b" : ""}`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <IconTile color="#4f46e5" icon="📄" size={36} radius={9} />
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-[var(--color-ink)]">{ch.title}</div>
                      <div className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">HTML · {ch.type || "html"}</div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost !px-3 !py-1.5 text-[13px]"
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      className="btn btn-ghost !px-3 !py-1.5 text-[13px] text-[var(--color-accent)]"
                      onClick={() => handleDeleteChapter(ch.id, ch.subjectId)}
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

      {showSubjectModal && (
        <Modal title="Add subject" onClose={() => setShowSubjectModal(false)}>
          <form onSubmit={handleCreateSubject}>
            <div className="mb-4">
              <label className={labelCls}>Name</label>
              <input
                type="text"
                className={inputCls}
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="e.g. History"
                required
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Icon (emoji)</label>
              <input
                type="text"
                className={inputCls}
                value={subjectForm.icon}
                onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Order</label>
              <input
                type="number"
                className={inputCls}
                value={subjectForm.order}
                onChange={(e) => setSubjectForm({ ...subjectForm, order: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? "Saving…" : "Create subject"}
            </button>
          </form>
        </Modal>
      )}

      {showChapterModal && (
        <Modal title="Add chapter" onClose={() => setShowChapterModal(false)} wide>
          <form onSubmit={handleCreateChapter}>
            <div className="mb-4">
              <label className={labelCls}>Subject</label>
              <select
                className={inputCls}
                value={chapterForm.subjectId}
                onChange={(e) => setChapterForm({ ...chapterForm, subjectId: e.target.value })}
                required
              >
                <option value="">Select subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Title (shown to students)</label>
              <input
                type="text"
                className={inputCls}
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                placeholder="e.g. Chapter 1 — Maratha Empire"
                required
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Description (optional)</label>
              <textarea
                className={inputCls}
                rows="2"
                value={chapterForm.description}
                onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Chapter link</label>
              <input
                type="url"
                className={inputCls}
                value={chapterForm.url}
                onChange={(e) => setChapterForm({ ...chapterForm, url: e.target.value })}
                placeholder="https://kernelknightx.github.io/enlift-notes-html/..."
              />
              <div className="mt-1 text-[12px] text-[var(--color-ink-faint)]">
                Paste your hosted chapter URL (recommended). Or upload a file below.
              </div>
            </div>
            <div className="mb-4">
              <label className={labelCls}>Upload file (optional)</label>
              <input
                type="file"
                className={`${inputCls} cursor-pointer file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--color-primary-tint)] file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-[var(--color-primary)]`}
                accept=".html,.htm,text/html"
                onChange={(e) => setChapterForm({ ...chapterForm, file: e.target.files[0] || null })}
              />
              <div className="mt-1 text-[12px] text-[var(--color-ink-faint)]">
                Optional — only if not using a chapter link above
              </div>
            </div>
            {chapterForm.file && (
              <div className="mb-4 rounded-[12px] border border-[rgba(37,99,235,0.22)] bg-[var(--cat-blue-t)] px-3.5 py-2.5 text-[13px] text-[var(--cat-blue)]">
                Selected: <strong>{chapterForm.file.name}</strong>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? "Uploading…" : "Add chapter"}
            </button>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
