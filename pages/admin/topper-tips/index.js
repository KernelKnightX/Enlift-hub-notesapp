import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Plus, Trash2, Edit3 } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { Field, SectionCard, inputClass } from "@/components/admin/adminFormStyles";

const EMPTY_FORM = { quote: "", attribution: "", rank: "", year: "", isActive: true };

export default function AdminTopperTipsPage() {
  const { user, loading, isAdmin } = useAdminGate();
  const [tips, setTips] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const unsub = onSnapshot(
      query(collection(db, "topperTips"), orderBy("createdAt", "desc")),
      (snap) => setTips(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (error) => {
        console.error(error);
        toast.error("Could not load topper tips.");
      },
    );
    return () => unsub();
  }, [isAdmin]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (tip) => {
    setForm({
      quote: tip.quote || "",
      attribution: tip.attribution || "",
      rank: tip.rank || "",
      year: tip.year || "",
      isActive: tip.isActive !== false,
    });
    setEditingId(tip.id);
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.quote.trim()) {
      toast.error("Quote is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        quote: form.quote.trim(),
        attribution: form.attribution.trim(),
        rank: form.rank.trim(),
        year: form.year.trim(),
        isActive: form.isActive,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || "",
      };
      if (editingId) {
        await updateDoc(doc(db, "topperTips", editingId), payload);
        toast.success("Topper tip updated.");
      } else {
        await addDoc(collection(db, "topperTips"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user?.uid || "",
        });
        toast.success("Topper tip added.");
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this topper tip?")) return;
    try {
      await deleteDoc(doc(db, "topperTips", id));
      toast.success("Topper tip deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <AdminLayout
      title="Topper tips"
      subtitle="Quotes shown on the student dashboard. One tip rotates each week."
      actions={(
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add tip
        </button>
      )}
    >
      {showForm ? (
        <SectionCard title={editingId ? "Edit tip" : "New tip"}>
          <form className="space-y-4" onSubmit={handleSave}>
            <Field label="Quote">
              <textarea className={inputClass} rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} required />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Attribution" hint="Optional — overrides rank/year line">
                <input className={inputClass} value={form.attribution} onChange={(e) => setForm({ ...form, attribution: e.target.value })} placeholder="AIR 42, UPSC CSE 2024" />
              </Field>
              <Field label="Rank">
                <input className={inputClass} value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} placeholder="42" />
              </Field>
              <Field label="Year">
                <input className={inputClass} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="2024" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save tip"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <div className="mt-6 space-y-3">
        {tips.length === 0 ? (
          <div className="card p-8 text-center text-sm text-[var(--color-ink-muted)]">
            No topper tips yet. Add quotes aspirants can see on the dashboard.
          </div>
        ) : (
          tips.map((tip) => (
            <div key={tip.id} className="card flex flex-col gap-3 p-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-italic-serif text-lg leading-snug">“{tip.quote}”</p>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  — {tip.attribution || `AIR ${tip.rank || "—"}, UPSC CSE ${tip.year || ""}`}
                </p>
                <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
                  {tip.isActive === false ? "Inactive" : "Active"}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(tip)}>
                  <Edit3 size={14} /> Edit
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDelete(tip.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
