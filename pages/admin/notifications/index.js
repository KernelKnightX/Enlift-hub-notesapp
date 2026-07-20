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

const TYPES = [
  { id: "info",    label: "Info",    color: "#3b82f6", bg: "#eff6ff" },
  { id: "success", label: "Success", color: "#10b981", bg: "#f0fdf4" },
  { id: "warning", label: "Warning", color: "#f59e0b", bg: "#fefce8" },
  { id: "error",   label: "Urgent",  color: "#ef4444", bg: "#fff1f2" },
];

const ICONS = ["🔔", "📢", "📌", "🚨", "✅", "📰", "🎯", "🏆", "💡", "⚠️", "🆕", "🎉"];

const EMPTY_FORM = { title: "", message: "", type: "info", icon: "🔔", isActive: true };

export default function AdminNotifications() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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
    const q = query(collection(db, "adminNotifications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));
    return () => unsub();
  }, [isAdmin]);

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); };

  const openEdit = (n) => {
    setForm({ title: n.title || "", message: n.message || "", type: n.type || "info", icon: n.icon || "🔔", isActive: n.isActive !== false });
    setEditingId(n.id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { toast.error("Title and message required."); return; }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        icon: form.icon,
        isActive: form.isActive,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      };

      if (editingId) {
        await updateDoc(doc(db, "adminNotifications", editingId), payload);
        toast.success("Notification updated!");
      } else {
        await addDoc(collection(db, "adminNotifications"), { ...payload, createdAt: serverTimestamp(), createdBy: user.uid });
        toast.success("Notification sent to students!");
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
    if (!window.confirm("Delete this notification?")) return;
    try { await deleteDoc(doc(db, "adminNotifications", id)); toast.success("Deleted."); }
    catch { toast.error("Delete failed."); }
  };

  const handleToggleActive = async (id, current) => {
    try {
      await updateDoc(doc(db, "adminNotifications", id), { isActive: !current, updatedAt: serverTimestamp() });
      toast.success(current ? "Hidden from students." : "Now visible to students.");
    } catch { toast.error("Update failed."); }
  };

  if (loading || authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#f0f4f8" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const activeCount = notifications.filter((n) => n.isActive).length;

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh" }}>

      {/* Header */}
      <div
        className="px-4 py-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)", boxShadow: "0 2px 12px rgba(30,58,95,.3)" }}
      >
        <div>
          <h1 className="h5 fw-bold mb-1 text-white">📢 Notifications Manager</h1>
          <div className="small" style={{ color: "rgba(255,255,255,.7)" }}>
            {notifications.length} total · {activeCount} active on students&apos; dashboard
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link href="/admin" className="btn btn-sm" style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}>← Admin</Link>
          <button
            className="btn btn-sm" onClick={() => { logout(); router.push("/login"); }}
            style={{ background: "rgba(255,255,255,.15)", color: "white", border: "1px solid rgba(255,255,255,.3)" }}
          >🚪 Logout</button>
        </div>
      </div>

      <div className="container-fluid px-3 px-md-4 py-4">

        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ background: "white" }}>
              <div className="h4 fw-bold text-primary mb-1">{notifications.length}</div>
              <div className="small text-muted">Total</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ background: "white" }}>
              <div className="h4 fw-bold text-success mb-1">{activeCount}</div>
              <div className="small text-muted">Visible to Students</div>
            </div>
          </div>
          {TYPES.map((t) => (
            <div key={t.id} className="col-6 col-md-3 d-none d-md-block">
              <div className="card border-0 shadow-sm text-center p-3" style={{ background: "white" }}>
                <div className="h4 fw-bold mb-1" style={{ color: t.color }}>
                  {notifications.filter(n => n.type === t.id).length}
                </div>
                <div className="small text-muted">{t.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="d-flex justify-content-end mb-4">
          <button className="btn btn-primary fw-semibold" onClick={openCreate} style={{ borderRadius: 8 }}>
            + New Notification
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card border-0 shadow mb-4" style={{ background: "white" }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: "#1e3a5f", color: "white" }}>
              <h5 className="mb-0 fw-bold">{editingId ? "Edit Notification" : "New Notification"}</h5>
              <button className="btn-close btn-close-white" onClick={() => setShowForm(false)} />
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-7">
                    <label className="form-label fw-semibold">Title *</label>
                    <input name="title" value={form.title} onChange={handleField} className="form-control" placeholder="Short notification title…" required />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label fw-semibold">Type</label>
                    <select name="type" value={form.type} onChange={handleField} className="form-select">
                      {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label fw-semibold">Icon</label>
                    <select name="icon" value={form.icon} onChange={handleField} className="form-select" style={{ fontSize: "1.2rem" }}>
                      {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Message *</label>
                  <textarea
                    name="message" value={form.message} onChange={handleField}
                    className="form-control" rows={3} placeholder="Notification body shown to students…" required
                  />
                </div>

                {/* Preview */}
                {form.title && (
                  <div className="mb-3 p-3 rounded-3" style={{
                    background: TYPES.find(t => t.id === form.type)?.bg || "#eff6ff",
                    borderLeft: `4px solid ${TYPES.find(t => t.id === form.type)?.color || "#3b82f6"}`,
                  }}>
                    <div className="small fw-bold text-muted mb-1">PREVIEW</div>
                    <div className="d-flex gap-2 align-items-start">
                      <span style={{ fontSize: "1.3rem" }}>{form.icon}</span>
                      <div>
                        <div className="fw-semibold small" style={{ color: "#1f2937" }}>{form.title}</div>
                        <div className="small text-muted">{form.message}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex align-items-center gap-4 mb-3">
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input" type="checkbox" role="switch"
                      name="isActive" checked={form.isActive} onChange={handleField} id="activeSwitch"
                    />
                    <label className="form-check-label fw-semibold" htmlFor="activeSwitch">
                      {form.isActive ? "Active — visible to students" : "Inactive — hidden from students"}
                    </label>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                    {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : (editingId ? "Update" : "Send Notification")}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        {notifications.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div style={{ fontSize: "3rem" }}>📢</div>
              <div className="fw-semibold text-muted mt-2">No notifications yet. Create one to alert students.</div>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm" style={{ background: "white" }}>
            <div className="card-header px-3 py-2" style={{ background: "#f8fafc" }}>
              <div className="fw-semibold" style={{ color: "#374151" }}>All Notifications ({notifications.length})</div>
            </div>
            <div className="list-group list-group-flush">
              {notifications.map((n) => {
                const typeMeta = TYPES.find(t => t.id === n.type) || TYPES[0];
                return (
                  <div key={n.id} className="list-group-item border-0 px-3 py-3" style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 44, height: 44, background: typeMeta.bg, fontSize: "1.3rem" }}
                      >
                        {n.icon || "🔔"}
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap gap-2 mb-1 align-items-center">
                          <span className="badge rounded-pill" style={{ background: typeMeta.bg, color: typeMeta.color, fontSize: "0.7rem", fontWeight: 700 }}>
                            {typeMeta.label}
                          </span>
                          <span
                            className="badge rounded-pill"
                            style={{ background: n.isActive ? "#dcfce7" : "#f3f4f6", color: n.isActive ? "#166534" : "#6b7280", fontSize: "0.7rem" }}
                          >
                            {n.isActive ? "✅ Active" : "🕐 Hidden"}
                          </span>
                          <span className="small text-muted">
                            {n.createdAt?.toDate?.()?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || ""}
                          </span>
                        </div>
                        <div className="fw-semibold" style={{ color: "#1f2937", fontSize: "0.93rem" }}>{n.title}</div>
                        <div className="small text-muted">{n.message}</div>
                      </div>
                      <div className="d-flex flex-column flex-sm-row gap-2 flex-shrink-0">
                        <button
                          className="btn btn-sm"
                          style={{ background: n.isActive ? "#fef3c7" : "#dcfce7", color: n.isActive ? "#92400e" : "#166534", border: "none", borderRadius: 6, fontSize: "0.75rem" }}
                          onClick={() => handleToggleActive(n.id, n.isActive)}
                        >
                          {n.isActive ? "Hide" : "Activate"}
                        </button>
                        <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 6, fontSize: "0.75rem" }} onClick={() => openEdit(n)}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6, fontSize: "0.75rem" }} onClick={() => handleDelete(n.id)}>🗑️</button>
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
