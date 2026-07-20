import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase/config";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp,
} from "firebase/firestore";

const CATEGORIES = [
  { id: "polity",        name: "Polity",           icon: "🏛️" },
  { id: "economy",       name: "Economy",           icon: "💰" },
  { id: "geography",     name: "Geography",         icon: "🌍" },
  { id: "history",       name: "History",           icon: "📜" },
  { id: "science",       name: "Science & Tech",    icon: "🔬" },
  { id: "environment",   name: "Environment",       icon: "🌿" },
  { id: "international", name: "International",     icon: "🌐" },
  { id: "schemes",       name: "Schemes",           icon: "📋" },
];

const EMPTY_FORM = {
  title: "",
  category: "polity",
  date: new Date().toISOString().split("T")[0],
  summary: "",
  content: "",
  tags: "",
  isActive: true,
};

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

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };

  const openEdit = (item) => {
    setForm({
      title:    item.title || "",
      category: item.category || "polity",
      date:     item.date || new Date().toISOString().split("T")[0],
      summary:  item.summary || "",
      content:  item.content || "",
      tags:     Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""),
      isActive: item.isActive !== false,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) {
      toast.error("Title and summary are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title:    form.title.trim(),
        category: form.category,
        date:     form.date,
        summary:  form.summary.trim(),
        content:  form.content.trim(),
        tags:     form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        isActive: form.isActive,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      };

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
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f4f8" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const displayed = filterCat === "all" ? affairs : affairs.filter((a) => a.category === filterCat);

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh" }}>

      {/* Header */}
      <div
        className="px-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)", boxShadow: "0 2px 12px rgba(30,58,95,.3)" }}
      >
        <div>
          <h1 className="h5 fw-bold mb-1 text-white">📰 Current Affairs Manager</h1>
          <div className="small" style={{ color: "rgba(255,255,255,.7)" }}>
            {affairs.length} articles total · {affairs.filter(a => a.isActive).length} published
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href="/admin" className="btn btn-sm" style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}>
            ← Admin
          </Link>
          <button
            className="btn btn-sm"
            style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}
            onClick={() => { logout(); router.push("/login"); }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="container-fluid px-3 px-md-4 py-4">

        {/* Actions row */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex flex-wrap gap-2">
            {["all", ...CATEGORIES.map(c => c.id)].map((cat) => {
              const meta = CATEGORIES.find(c => c.id === cat);
              return (
                <button
                  key={cat}
                  className="btn btn-sm"
                  style={{
                    borderRadius: 20,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    background: filterCat === cat ? "#1e3a5f" : "white",
                    color:      filterCat === cat ? "white" : "#374151",
                    border:     "1px solid #d1d5db",
                  }}
                  onClick={() => setFilterCat(cat)}
                >
                  {meta ? `${meta.icon} ${meta.name}` : "📌 All"}
                </button>
              );
            })}
          </div>
          <button
            className="btn btn-primary fw-semibold"
            onClick={openCreate}
            style={{ borderRadius: 8 }}
          >
            + New Article
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card border-0 shadow mb-4" style={{ background: "white" }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: "#1e3a5f", color: "white" }}>
              <h5 className="mb-0 fw-bold">{editingId ? "Edit Article" : "New Current Affairs Article"}</h5>
              <button className="btn-close btn-close-white" onClick={() => setShowForm(false)} />
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-8">
                    <label className="form-label fw-semibold">Title *</label>
                    <input
                      name="title" value={form.title} onChange={handleField}
                      className="form-control" placeholder="Article headline…" required
                    />
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label fw-semibold">Category *</label>
                    <select name="category" value={form.category} onChange={handleField} className="form-select">
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label fw-semibold">Date *</label>
                    <input name="date" type="date" value={form.date} onChange={handleField} className="form-control" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Summary * <span className="text-muted fw-normal">(shown in card)</span></label>
                  <textarea
                    name="summary" value={form.summary} onChange={handleField}
                    className="form-control" rows={3} placeholder="Brief 1-2 line summary shown on the card…" required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Content <span className="text-muted fw-normal">(optional, shown on &quot;Read more&quot;)</span></label>
                  <textarea
                    name="content" value={form.content} onChange={handleField}
                    className="form-control" rows={5} placeholder="Detailed article content…"
                  />
                </div>

                <div className="row g-3 mb-3 align-items-center">
                  <div className="col-12 col-md-9">
                    <label className="form-label fw-semibold">Tags <span className="text-muted fw-normal">(comma-separated)</span></label>
                    <input
                      name="tags" value={form.tags} onChange={handleField}
                      className="form-control" placeholder="e.g. RBI, Economy, Interest Rate"
                    />
                  </div>
                  <div className="col-12 col-md-3 d-flex align-items-center gap-2 pt-md-4">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input" type="checkbox"
                        name="isActive" checked={form.isActive} onChange={handleField}
                        id="isActiveCheck" role="switch"
                      />
                      <label className="form-check-label fw-semibold" htmlFor="isActiveCheck">
                        {form.isActive ? "Published" : "Draft"}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : (editingId ? "Update Article" : "Publish Article")}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ background: "white" }}>
              <div className="h4 fw-bold text-primary mb-1">{affairs.length}</div>
              <div className="small text-muted">Total Articles</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ background: "white" }}>
              <div className="h4 fw-bold text-success mb-1">{affairs.filter(a => a.isActive).length}</div>
              <div className="small text-muted">Published</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ background: "white" }}>
              <div className="h4 fw-bold text-warning mb-1">{affairs.filter(a => !a.isActive).length}</div>
              <div className="small text-muted">Drafts</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ background: "white" }}>
              <div className="h4 fw-bold text-info mb-1">{CATEGORIES.length}</div>
              <div className="small text-muted">Categories</div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        {displayed.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div style={{ fontSize: "3rem" }}>📰</div>
              <div className="fw-semibold text-muted mt-2">No articles yet. Click &quot;New Article&quot; to get started.</div>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-header px-3 py-2 border-bottom" style={{ background: "#f8fafc" }}>
              <div className="fw-semibold" style={{ color: "#374151" }}>Articles ({displayed.length})</div>
            </div>
            <div className="list-group list-group-flush">
              {displayed.map((a) => {
                const catMeta = CATEGORIES.find((c) => c.id === a.category);
                return (
                  <div key={a.id} className="list-group-item border-0 px-3 py-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <span className="badge rounded-pill" style={{ background: "#f0f4f8", color: "#374151", fontSize: "0.7rem" }}>
                            {catMeta?.icon} {catMeta?.name || a.category}
                          </span>
                          <span
                            className="badge rounded-pill"
                            style={{
                              background: a.isActive ? "#dcfce7" : "#fef9c3",
                              color:      a.isActive ? "#166534" : "#92400e",
                              fontSize: "0.7rem",
                            }}
                          >
                            {a.isActive ? "✅ Published" : "🕐 Draft"}
                          </span>
                          <span className="small text-muted">{a.date}</span>
                        </div>
                        <div className="fw-semibold mb-1" style={{ color: "#1f2937", fontSize: "0.93rem" }}>{a.title}</div>
                        <div className="small text-muted text-truncate">{a.summary}</div>
                        {a.tags?.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {a.tags.slice(0, 4).map((t, i) => (
                              <span key={i} className="badge" style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "0.65rem" }}>{t}</span>
                            ))}
                            {a.tags.length > 4 && <span className="badge" style={{ background: "#f3f4f6", color: "#6b7280", fontSize: "0.65rem" }}>+{a.tags.length - 4}</span>}
                          </div>
                        )}
                      </div>
                      <div className="d-flex flex-column flex-sm-row gap-2 flex-shrink-0">
                        <button
                          className="btn btn-sm"
                          style={{ background: a.isActive ? "#fef3c7" : "#dcfce7", color: a.isActive ? "#92400e" : "#166534", border: "none", borderRadius: 6, fontSize: "0.75rem" }}
                          onClick={() => handleToggleActive(a.id, a.isActive)}
                        >
                          {a.isActive ? "Hide" : "Publish"}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          style={{ borderRadius: 6, fontSize: "0.75rem" }}
                          onClick={() => openEdit(a)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          style={{ borderRadius: 6, fontSize: "0.75rem" }}
                          onClick={() => handleDelete(a.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
