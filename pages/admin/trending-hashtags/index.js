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

const EMPTY_FORM = { tag: "", category: "General", engagement: 0, isActive: true };

export default function AdminTrendingHashtagsPage() {
  const { user, loading, isAdmin } = useAdminGate();
  const [hashtags, setHashtags] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) return undefined;
    const unsub = onSnapshot(
      query(collection(db, "trendingHashtags"), orderBy("engagement", "desc")),
      (snap) => setHashtags(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
      (error) => {
        console.error(error);
        toast.error("Could not load trending hashtags.");
      },
    );
    return () => unsub();
  }, [isAdmin]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      tag: item.tag || "",
      category: item.category || "General",
      engagement: Number(item.engagement) || 0,
      isActive: item.isActive !== false,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.tag.trim()) {
      toast.error("Hashtag is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tag: form.tag.trim().startsWith("#") ? form.tag.trim() : `#${form.tag.trim()}`,
        category: form.category.trim() || "General",
        engagement: Number(form.engagement) || 0,
        isActive: form.isActive,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || "",
      };
      if (editingId) {
        await updateDoc(doc(db, "trendingHashtags", editingId), payload);
        toast.success("Hashtag updated.");
      } else {
        await addDoc(collection(db, "trendingHashtags"), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: user?.uid || "",
        });
        toast.success("Hashtag added.");
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
    if (!window.confirm("Delete this hashtag?")) return;
    try {
      await deleteDoc(doc(db, "trendingHashtags", id));
      toast.success("Hashtag deleted.");
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
      title="Trending hashtags"
      subtitle="Sidebar tags on the student Current Affairs page, sorted by engagement."
      actions={(
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add hashtag
        </button>
      )}
    >
      {showForm ? (
        <SectionCard title={editingId ? "Edit hashtag" : "New hashtag"}>
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Hashtag">
                <input className={inputClass} value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="#UPSC2026" required />
              </Field>
              <Field label="Category">
                <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Geopolitics" />
              </Field>
              <Field label="Engagement score" hint="Higher scores appear first">
                <input className={inputClass} type="number" min="0" value={form.engagement} onChange={(e) => setForm({ ...form, engagement: e.target.value })} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save hashtag"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-left">
            <tr>
              <th className="px-4 py-3">Hashtag</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Engagement</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hashtags.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-ink-muted)]">
                  No hashtags yet.
                </td>
              </tr>
            ) : (
              hashtags.map((item) => (
                <tr key={item.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 font-semibold">{item.tag}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{item.engagement ?? 0}</td>
                  <td className="px-4 py-3">{item.isActive === false ? "Inactive" : "Active"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}>
                        <Edit3 size={14} />
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
