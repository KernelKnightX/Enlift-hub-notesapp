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
import AdminLayout from "@/layouts/AdminLayout";

const TYPES = [
  { id: "info",    label: "Info",    color: "var(--color-primary)", bg: "var(--color-primary-tint)", chip: "chip-primary" },
  { id: "success", label: "Success", color: "var(--color-success)", bg: "var(--cat-green-t)",         chip: "chip-green" },
  { id: "warning", label: "Warning", color: "var(--color-gold)",    bg: "var(--cat-amber-t)",         chip: "chip-amber" },
  { id: "error",   label: "Urgent",  color: "var(--color-accent-hover)", bg: "var(--color-accent-tint)", chip: "chip-accent" },
];

const ICONS = ["🔔", "📢", "📌", "🚨", "✅", "📰", "🎯", "🏆", "💡", "⚠️", "🆕", "🎉"];

const EMPTY_FORM = { title: "", message: "", type: "info", icon: "🔔", isActive: true, href: "", target: "dashboard" };

const inputCls =
  "w-full rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none transition-colors focus:border-[var(--color-primary)]";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-[var(--color-ink-2)]";

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
    setForm({
      title: n.title || "",
      message: n.message || "",
      type: n.type || "info",
      icon: n.icon || "🔔",
      isActive: n.isActive !== false,
      href: n.href || "",
      target: n.target || "dashboard",
    });
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
        href: form.href.trim(),
        target: form.target || "dashboard",
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const activeCount = notifications.filter((n) => n.isActive).length;
  const previewType = TYPES.find(t => t.id === form.type) || TYPES[0];

  return (
    <AdminLayout
      title="Homepage notices"
      subtitle={`${notifications.length} total · ${activeCount} active. These can appear on the public homepage and student desk.`}
    >
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
          <div className="card p-4 text-center">
            <div className="display-num text-2xl text-[var(--color-primary)]">{notifications.length}</div>
            <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">Total</div>
          </div>
          <div className="card p-4 text-center">
            <div className="display-num text-2xl text-[var(--color-success)]">{activeCount}</div>
            <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">Visible to students</div>
          </div>
          {TYPES.map((t) => (
            <div key={t.id} className="card hidden p-4 text-center md:block">
              <div className="display-num text-2xl" style={{ color: t.color }}>
                {notifications.filter(n => n.type === t.id).length}
              </div>
              <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">{t.label}</div>
            </div>
          ))}
        </div>

        {/* Action */}
        <div className="mb-5 flex justify-end">
          <button className="btn btn-primary" onClick={openCreate}>
            + New notification
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card fade-up mb-6 overflow-hidden">
            <div className="hairline-b flex items-center justify-between bg-[var(--color-surface-alt)] px-5 py-3.5">
              <h5 className="text-[15px] font-semibold text-[var(--color-ink)]">
                {editingId ? "Edit notification" : "New notification"}
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
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-7">
                  <label className={labelCls}>Title *</label>
                  <input name="title" value={form.title} onChange={handleField} className={inputCls} placeholder="Short notification title…" required />
                </div>
                <div className="sm:col-span-3">
                  <label className={labelCls}>Type</label>
                  <select name="type" value={form.type} onChange={handleField} className={inputCls}>
                    {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Icon</label>
                  <select name="icon" value={form.icon} onChange={handleField} className={`${inputCls} text-lg`}>
                    {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className={labelCls}>Message *</label>
                <textarea
                  name="message" value={form.message} onChange={handleField}
                  className={inputCls} rows={3} placeholder="Notification body shown to students…" required
                />
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <label className={labelCls}>Redirect link</label>
                  <input
                    name="href"
                    value={form.href}
                    onChange={handleField}
                    className={inputCls}
                    placeholder="https://example.com or /updates/example"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className={labelCls}>Target</label>
                  <select
                    name="target"
                    value={form.target}
                    onChange={handleField}
                    className={inputCls}
                  >
                    <option value="dashboard">Dashboard only</option>
                    <option value="home">Homepage only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="sm:col-span-4 flex items-end">
                  <div className="flex items-center gap-3 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 w-full">
                    <input
                      id="isActive"
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleField}
                      className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <label htmlFor="isActive" className="text-[13px] text-[var(--color-ink)]">
                      Active now
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {form.title && (
                <div
                  className="mb-4 rounded-[12px] p-3.5"
                  style={{ background: previewType.bg, borderLeft: `4px solid ${previewType.color}` }}
                >
                  <div className="eyebrow mb-1.5">Preview</div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl leading-none">{form.icon}</span>
                    <div>
                      <div className="text-[14px] font-semibold text-[var(--color-ink)]">{form.title}</div>
                      <div className="text-[13px] text-[var(--color-ink-muted)]">{form.message}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-5 flex items-center gap-2.5">
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
                  {form.isActive ? "Active — visible to students" : "Inactive — hidden from students"}
                </span>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : (editingId ? "Update" : "Send notification")}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {notifications.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl">📢</div>
            <div className="mt-3 font-semibold text-[var(--color-ink-muted)]">
              No notifications yet. Create one to alert students.
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-3">
              <div className="text-[13px] font-semibold text-[var(--color-ink-2)]">
                All notifications ({notifications.length})
              </div>
            </div>
            <div>
              {notifications.map((n, i) => {
                const typeMeta = TYPES.find(t => t.id === n.type) || TYPES[0];
                return (
                  <div
                    key={n.id}
                    className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between ${i !== notifications.length - 1 ? "hairline-b" : ""}`}
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <div
                        className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-[12px] text-xl"
                        style={{ background: typeMeta.bg }}
                      >
                        {n.icon || "🔔"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className={`chip ${typeMeta.chip}`}>{typeMeta.label}</span>
                          <span className={`chip ${n.isActive ? "chip-green" : ""}`}>
                            {n.isActive ? "Active" : "Hidden"}
                          </span>
                          <span className="text-[12px] text-[var(--color-ink-faint)]">
                            {n.createdAt?.toDate?.()?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || ""}
                          </span>
                        </div>
                        <div className="text-[14px] font-semibold text-[var(--color-ink)]">{n.title}</div>
                        <div className="text-[13px] text-[var(--color-ink-muted)]">{n.message}</div>
                        <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-[var(--color-ink-faint)]">
                          <span className="chip chip-ink">{n.target || 'dashboard'}</span>
                          {n.href && (
                            <span className="truncate" style={{ maxWidth: '220px' }}>
                              Link: {n.href}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-2 sm:flex-col">
                      <button
                        className="btn btn-ghost !px-3 !py-1.5 text-[13px]"
                        onClick={() => handleToggleActive(n.id, n.isActive)}
                      >
                        {n.isActive ? "Hide" : "Activate"}
                      </button>
                      <button className="btn btn-ghost !px-3 !py-1.5 text-[13px]" onClick={() => openEdit(n)}>Edit</button>
                      <button
                        className="btn !px-3 !py-1.5 text-[13px]"
                        style={{ background: "var(--color-accent-tint)", color: "var(--color-accent-hover)" }}
                        onClick={() => handleDelete(n.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </AdminLayout>
  );
}