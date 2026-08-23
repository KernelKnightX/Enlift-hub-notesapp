import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Edit3, Landmark, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { GOV_SECTIONS, sectionLabel, deleteGovItem } from "@/lib/firestore/government";

const allSection = { value: "all", label: "All Sections" };

export default function AdminGovernmentPage() {
  const { loading, isAdmin } = useAdminGate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "government"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => {
      console.error(error);
      toast.error("Failed to load Government items.");
    });
    return () => unsub();
  }, [isAdmin]);

  const counts = useMemo(() => {
    const base = { all: items.length };
    GOV_SECTIONS.forEach((item) => {
      base[item.value] = items.filter((govItem) => govItem.section === item.value).length;
    });
    return base;
  }, [items]);

  const displayed = filter === "all" ? items : items.filter((govItem) => govItem.section === filter);
  const published = items.filter((item) => item.status === "published").length;
  const drafts = items.length - published;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      await deleteGovItem(id);
      toast.success("Item deleted.");
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
      title="Government"
      subtitle={`${items.length} items · ${published} published · ${drafts} drafts`}
      actions={(
        <Link href="/admin/government/schemes/new" className="btn btn-primary">
          <Plus size={16} /> Add Item
        </Link>
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {GOV_SECTIONS.map((item) => (
          <Link key={item.value} href={`/admin/government/${item.value}`} className="card p-3 text-center hover:shadow">
            <div className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{item.label}</div>
            <div className="text-xs text-[var(--color-ink-muted)] mt-1">{counts[item.value] || 0} items</div>
          </Link>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[allSection, ...GOV_SECTIONS].map((item) => (
          <button
            key={item.value}
            type="button"
            className={`chip ${filter === item.value ? "chip-primary" : ""}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label} {counts[item.value] || 0}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="card p-12 text-center">
          <Landmark className="mx-auto mb-3 text-[var(--color-primary)]" size={32} strokeWidth={1.6} />
          <div className="font-semibold text-[var(--color-ink)]">No items in this section yet.</div>
          <Link href="/admin/government/schemes/new" className="btn btn-primary mt-5">
            <Plus size={16} /> Add Item
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-3">
            <div className="text-[13px] font-semibold text-[var(--color-ink-2)]">Items ({displayed.length})</div>
          </div>
          <div>
            {displayed.map((item, index) => (
              <div
                key={item.id}
                className={`grid gap-4 px-5 py-4 md:grid-cols-[72px_1fr_auto] md:items-center ${index !== displayed.length - 1 ? "hairline-b" : ""}`}
              >
                <div className="h-[72px] w-[72px] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                  {item.thumbnailUrl || item.imageUrl ? (
                    <img src={item.thumbnailUrl || item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip chip-primary">{sectionLabel(item.section)}</span>
                    <span className={`chip ${item.status === "published" ? "chip-green" : "chip-amber"}`}>
                      {item.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--color-ink)]">{item.title}</div>
                  <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">/{item.slug}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/government/${item.section}/${item.id}/edit`} className="btn btn-ghost !px-3 !py-2 text-[13px]">
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="btn !px-3 !py-2 text-[13px]"
                    style={{ background: "var(--color-accent-tint)", color: "var(--color-accent-hover)" }}
                  >
                    <Trash2 size={14} /> Delete
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