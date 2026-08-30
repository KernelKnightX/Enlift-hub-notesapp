import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Edit3, Map, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import AdminLayout from "@/layouts/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { MAP_CATEGORIES, categoryLabel, deleteMap } from "@/lib/firestore/maps";

const allCategory = { value: "all", label: "All Maps" };

export default function AdminMapsPage() {
  const { loading, isAdmin } = useAdminGate();
  const [maps, setMaps] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "maps"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMaps(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
    }, (error) => {
      console.error(error);
      toast.error("Failed to load maps.");
    });
    return () => unsub();
  }, [isAdmin]);

  const counts = useMemo(() => {
    const base = { all: maps.length };
    MAP_CATEGORIES.forEach((item) => {
      base[item.value] = maps.filter((mapItem) => mapItem.category === item.value).length;
    });
    return base;
  }, [maps]);

  const displayed = filter === "all" ? maps : maps.filter((mapItem) => mapItem.category === filter);
  const published = maps.filter((item) => item.status === "published").length;
  const drafts = maps.length - published;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this map permanently?")) return;
    try {
      await deleteMap(id);
      toast.success("Map deleted.");
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
      title="Maps & Atlas"
      subtitle={`${maps.length} maps · ${published} published · ${drafts} drafts`}
      actions={(
        <Link href="/admin/maps/new" className="btn btn-primary">
          <Plus size={16} /> Add Map
        </Link>
      )}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {MAP_CATEGORIES.map((item) => (
          <Link key={item.value} href={`/admin/maps/${item.value}`} className="card p-3 text-center hover:shadow">
            <div className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>{item.label}</div>
            <div className="text-xs text-[var(--color-ink-muted)] mt-1">{counts[item.value] || 0} items</div>
          </Link>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {[allCategory, ...MAP_CATEGORIES].map((item) => (
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
          <Map className="mx-auto mb-3 text-[var(--color-primary)]" size={32} strokeWidth={1.6} />
          <div className="font-semibold text-[var(--color-ink)]">No maps in this category yet.</div>
          <Link href="/admin/maps/new" className="btn btn-primary mt-5">
            <Plus size={16} /> Add Map
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-3">
            <div className="text-[13px] font-semibold text-[var(--color-ink-2)]">Maps ({displayed.length})</div>
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
                    <span className="chip chip-primary">{categoryLabel(item.category)}</span>
                    <span className={`chip ${item.status === "published" ? "chip-green" : "chip-amber"}`}>
                      {item.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--color-ink)]">{item.title}</div>
                  <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">/{item.slug}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/maps/map/${item.id}/edit`} className="btn btn-ghost !px-3 !py-2 text-[13px]">
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
