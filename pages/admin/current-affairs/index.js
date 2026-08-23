import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import { db, storage } from "../../../firebase/config";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminLayout from "@/layouts/AdminLayout";

// Starter suggestions only — admins can type any subject they want and it
// becomes a real, filterable category the moment an article uses it. This
// mirrors the student-facing page, which derives its subject list from
// whatever categories actually exist on published articles.
const SUGGESTED_SUBJECTS = [
  "Polity", "Economy", "National", "International", "Geopolitics", "World",
  "Tech", "Environment", "History", "Society", "Schemes",
];

// Same palette + hashing approach as the student page, so a subject always
// renders with the same chip color everywhere it appears.
const CAT_CHIP = {
  Polity: "chip-violet", Economy: "chip-amber", Geography: "chip-blue", History: "chip-gold",
  Tech: "chip-cyan", "Science & Tech": "chip-cyan", Environment: "chip-green",
  International: "chip-pink", Geopolitics: "chip-pink", World: "chip-pink",
  National: "chip-amber", Society: "chip-lime", Schemes: "chip-lime",
};
const CHIP_PALETTE = ["chip-violet", "chip-blue", "chip-green", "chip-pink", "chip-cyan", "chip-amber", "chip-lime", "chip-gold"];
const chipFor = (category) => {
  if (!category) return "chip-primary";
  if (CAT_CHIP[category]) return CAT_CHIP[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return CHIP_PALETTE[hash % CHIP_PALETTE.length];
};

const ICONS = {
  Polity: "🏛️", Economy: "💰", Geography: "🌍", History: "📜", Tech: "🔬",
  "Science & Tech": "🔬", Environment: "🌿", International: "🌐", Geopolitics: "🌐",
  World: "🌐", National: "🇮🇳", Society: "🧑‍🤝‍🧑", Schemes: "📋",
};
const iconFor = (category) => ICONS[category] || "🏷️";

const EMPTY_FORM = {
  title: "",
  category: "",
  date: new Date().toISOString().split("T")[0],
  summary: "",
  content: "",
  tags: "",
  imageUrl: "",
  isActive: true,
};

const inputCls =
  "w-full rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-primary)]";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";

export default function AdminCurrentAffairs() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [affairs, setAffairs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [filterCat, setFilterCat] = useState("all");

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

  /* ── Real-time list ── */
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "currentAffairs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setAffairs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));
    return () => unsub();
  }, [isAdmin]);

  // Every subject actually in use, plus the starter suggestions — this is
  // what powers both the filter row and the datalist in the form.
  const knownSubjects = useMemo(() => {
    const used = affairs.map((a) => a.category).filter(Boolean);
    return Array.from(new Set([...SUGGESTED_SUBJECTS, ...used])).sort((a, b) => a.localeCompare(b));
  }, [affairs]);

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      title:    item.title || "",
      category: item.category || "",
      date:     item.date || new Date().toISOString().split("T")[0],
      summary:  item.summary || "",
      content:  item.content || "",
      tags:     Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""),
      isActive: item.isActive !== false,
    });
    setEditingId(item.id);
    setImageFile(null);
    setImagePreview(item.imageUrl || "");
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error("Title and summary are required.");
      return;
    }
    if (!form.category.trim()) {
      toast.error("Give this article a subject.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title:    form.title.trim(),
        category: form.category.trim(),
        date:     form.date,
        summary:  form.summary.trim(),
        content:  form.content.trim(),
        tags:     form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        imageUrl: form.imageUrl.trim(),
        isActive: form.isActive,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      };

      if (imageFile) {
        const storageRef = ref(storage, `current-affairs/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        payload.imageUrl = await getDownloadURL(storageRef);
      }

      if (editingId) {
        await updateDoc(doc(db, "currentAffairs", editingId), payload);
        toast.success("Article updated!");
      } else {
        await addDoc(collection(db, "currentAffairs"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
        });
        toast.success("Article published!");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save.");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article permanently?")) return;
    try {
      await deleteDoc(doc(db, "currentAffairs", id));
      toast.success("Deleted.");
    } catch (err) {
      toast.error("Delete failed.");
    }
  };

  const handleToggleActive = async (id, current) => {
    try {
      await updateDoc(doc(db, "currentAffairs", id), { isActive: !current, updatedAt: serverTimestamp() });
      toast.success(current ? "Hidden from students." : "Published to students.");
    } catch {
      toast.error("Update failed.");
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

  const displayed = filterCat === "all" ? affairs : affairs.filter((a) => a.category === filterCat);
  const publishedCount = affairs.filter((a) => a.isActive).length;
  const draftCount = affairs.filter((a) => !a.isActive).length;
  const subjectsInUse = Array.from(new Set(affairs.map((a) => a.category).filter(Boolean)));

  return (
    <AdminLayout
      title="Current Affairs"
      subtitle={`${affairs.length} articles · ${publishedCount} published · ${draftCount} drafts`}
    >
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card p-4 text-center">
            <div className="display-num text-2xl text-[var(--color-primary)]">{affairs.length}</div>
            <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">Total articles</div>
          </div>
          <div className="card p-4 text-center">
            <div className="display-num text-2xl text-[var(--color-success)]">{publishedCount}</div>
            <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">Published</div>
          </div>
          <div className="card p-4 text-center">
            <div className="display-num text-2xl text-[var(--color-gold)]">{draftCount}</div>
            <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">Drafts</div>
          </div>
          <div className="card p-4 text-center">
            <div className="display-num text-2xl text-[var(--cat-cyan)]">{subjectsInUse.length}</div>
            <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">Subjects in use</div>
          </div>
        </div>

        {/* Actions row — filter chips are built from real data, not a fixed list */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              className={`chip ${filterCat === "all" ? "chip-ink" : ""}`}
              onClick={() => setFilterCat("all")}
            >
              All
            </button>
            {subjectsInUse.map((subject) => (
              <button
                key={subject}
                className={`chip ${filterCat === subject ? "chip-ink" : chipFor(subject)}`}
                onClick={() => setFilterCat(subject)}
              >
                {iconFor(subject)} {subject}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + New article
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card fade-up mb-6 overflow-hidden">
            <div className="hairline-b flex items-center justify-between bg-[var(--color-surface-alt)] px-5 py-3.5">
              <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">
                {editingId ? "Edit article" : "New current affairs article"}
              </h5>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-ink)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5">
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-8">
                <div className="sm:col-span-4">
                  <label className={labelCls}>Title *</label>
                  <input
                    name="title" value={form.title} onChange={handleField}
                    className={inputCls} placeholder="Article headline…" required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>
                    Subject * <span className="font-normal text-[var(--color-ink-faint)]">(type any)</span>
                  </label>
                  <input
                    name="category" value={form.category} onChange={handleField}
                    className={inputCls} placeholder="e.g. Geopolitics"
                    list="subject-suggestions" required
                  />
                  <datalist id="subject-suggestions">
                    {knownSubjects.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Date *</label>
                  <input name="date" type="date" value={form.date} onChange={handleField} className={inputCls} required />
                </div>
              </div>

              {form.category && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-[12px] text-[var(--color-ink-faint)]">Preview:</span>
                  <span className={`chip ${chipFor(form.category)}`}>{iconFor(form.category)} {form.category}</span>
                </div>
              )}

              <div className="mb-4">
                <label className={labelCls}>
                  Summary * <span className="font-normal text-[var(--color-ink-faint)]">(shown in card)</span>
                </label>
                <textarea
                  name="summary" value={form.summary} onChange={handleField}
                  className={inputCls} rows={3} placeholder="Brief 1-2 line summary shown on the card…" required
                />
              </div>

              <div className="mb-4">
                <label className={labelCls}>
                  Full content <span className="font-normal text-[var(--color-ink-faint)]">(optional, shown on "Read more")</span>
                </label>
                <textarea
                  name="content" value={form.content} onChange={handleField}
                  className={inputCls} rows={5} placeholder="Detailed article content…"
                />
              </div>

              <div className="mb-4 sm:col-span-4">
                <label className={labelCls}>Image URL</label>
                <input
                  name="imageUrl" value={form.imageUrl} onChange={handleField}
                  className={inputCls} placeholder="Paste image link for the article"
                />
              </div>
              <div className="mb-4 sm:col-span-4">
                <label className={labelCls}>Upload image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className={inputCls} style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                />
                {imagePreview && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-[var(--color-border)]">
                    <img src={imagePreview} alt="Article preview" className="w-full object-cover" style={{ maxHeight: 200 }} />
                  </div>
                )}
              </div>
              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
                <div className="sm:col-span-3">
                  <label className={labelCls}>Tags <span className="font-normal text-[var(--color-ink-faint)]">(comma-separated)</span></label>
                  <input
                    name="tags" value={form.tags} onChange={handleField}
                    className={inputCls} placeholder="e.g. RBI, Economy, Interest Rate"
                  />
                </div>
                <div className="flex items-center gap-2.5 pb-0.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isActive}
                    onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                    className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{ background: form.isActive ? "var(--color-primary)" : "var(--color-border-strong)" }}
                  >
                    <span
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                      style={{ transform: form.isActive ? "translateX(22px)" : "translateX(2px)" }}
                    />
                  </button>
                  <span className="text-[13px] font-semibold text-[var(--color-ink-2)]">
                    {form.isActive ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : (editingId ? "Update article" : "Publish article")}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Articles List */}
        {displayed.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl">📰</div>
            <div className="mt-3 font-semibold text-[var(--color-ink-muted)]">
              No articles yet. Click "New article" to get started.
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-3">
              <div className="text-[13px] font-semibold text-[var(--color-ink-2)]">
                Articles ({displayed.length})
              </div>
            </div>
            <div>
              {displayed.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between ${i !== displayed.length - 1 ? "hairline-b" : ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className={`chip ${chipFor(a.category)}`}>
                        {iconFor(a.category)} {a.category}
                      </span>
                      <span className={`chip ${a.isActive ? "chip-green" : "chip-gold"}`}>
                        {a.isActive ? "Published" : "Draft"}
                      </span>
                      <span className="text-[12px] text-[var(--color-ink-faint)]">{a.date}</span>
                    </div>
                    <div className="mb-0.5 text-[15px] font-semibold text-[var(--color-ink)]">{a.title}</div>
                    <div className="clamp-2 text-[13px] text-[var(--color-ink-muted)]">{a.summary}</div>
                    {a.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {a.tags.slice(0, 4).map((t, ti) => (
                          <span key={ti} className="chip">{t}</span>
                        ))}
                        {a.tags.length > 4 && <span className="chip">+{a.tags.length - 4}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                    <button
                      className="btn btn-ghost !px-3 !py-1.5 text-[13px]"
                      onClick={() => handleToggleActive(a.id, a.isActive)}
                    >
                      {a.isActive ? "Hide" : "Publish"}
                    </button>
                    <button
                      className="btn btn-ghost !px-3 !py-1.5 text-[13px]"
                      onClick={() => openEdit(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn !px-3 !py-1.5 text-[13px]"
                      style={{ background: "var(--color-accent-tint)", color: "var(--color-accent-hover)" }}
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </AdminLayout>
  );
}