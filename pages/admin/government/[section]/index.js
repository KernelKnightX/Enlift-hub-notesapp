import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { ArrowLeft, Edit3, Landmark, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AdminLayout from "@/components/admin/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { sectionLabel, isValidSection, deleteGovItem } from "@/lib/firestore/government";

export default function AdminGovernmentSectionPage() {
  const { loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const { section } = router.query;
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin || !section) return;
    const q = query(
      collection(db, "government"),
      where("section", "==", section),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      setItemsLoading(false);
    }, (error) => {
      console.error(error);
      toast.error("Failed to load items.");
      setItemsLoading(false);
    });
    return () => unsub();
  }, [isAdmin, section]);

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

  if (loading || (isAdmin && !router.isReady)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }
  if (!isAdmin) return null;

  if (router.isReady && !isValidSection(section)) {
    return (
      <AdminLayout title="Government" subtitle="Unknown section">
        <div className="card p-12 text-center">
          <div className="font-semibold text-[var(--color-ink)]">
            "{section}" isn't a recognized Government section.
          </div>
          <Link href="/admin/government" className="btn btn-ghost mt-5">
            <ArrowLeft size={16} /> Back to Government
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const published = items.filter((item) => item.status === "published").length;
  const drafts = items.length - published;

  return (
    <AdminLayout
      title={sectionLabel(section)}
      subtitle={itemsLoading ? "Loading…" : `${items.length} items · ${published} published · ${drafts} drafts`}
      actions={(
        <div className="flex gap-2">
          <Link href="/admin/government" className="btn btn-ghost">
            <ArrowLeft size={16} /> Back
          </Link>
          <Link href={`/admin/government/${section}/new`} className="btn btn-primary">
            <Plus size={16} /> Add Item
          </Link>
        </div>
      )}
    >
      {!itemsLoading && items.length === 0 ? (
        <div className="card p-12 text-center">
          <Landmark className="mx-auto mb-3 text-[var(--color-primary)]" size={32} strokeWidth={1.6} />
          <div className="font-semibold text-[var(--color-ink)]">No items in {sectionLabel(section)} yet.</div>
          <Link href={`/admin/government/${section}/new`} className="btn btn-primary mt-5">
            <Plus size={16} /> Add Item
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-3">
            <div className="text-[13px] font-semibold text-[var(--color-ink-2)]">Items ({items.length})</div>
          </div>
          <div>
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`grid gap-4 px-5 py-4 md:grid-cols-[72px_1fr_auto] md:items-center ${index !== items.length - 1 ? "hairline-b" : ""}`}
              >
                <div className="h-[72px] w-[72px] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                  {item.thumbnailUrl || item.imageUrl ? (
                    <img src={item.thumbnailUrl || item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <span className={`chip ${item.status === "published" ? "chip-green" : "chip-amber"}`}>
                    {item.status === "published" ? "Published" : "Draft"}
                  </span>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--color-ink)]">{item.title}</div>
                  <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">/{item.slug}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/government/${section}/${item.id}/edit`} className="btn btn-ghost !px-3 !py-2 text-[13px]">
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