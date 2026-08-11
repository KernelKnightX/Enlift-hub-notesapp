import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { Map, Edit3, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { db } from "@/firebase/config";
import { MAP_CATEGORIES, categoryLabel, deleteMap } from "@/lib/firestore/maps";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function CategoryAdminPage() {
  const { loading, isAdmin } = useAdminGate();
  const router = useRouter();
  const routeCategory = router.query.category || "";
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    if (!isAdmin || !routeCategory) return;
    const q = query(collection(db, "maps"), where("category", "==", routeCategory), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMaps(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error(err);
      toast.error("Failed to load maps for category.");
    });
    return () => unsub();
  }, [isAdmin, routeCategory]);

  if (loading) return null;
  if (!isAdmin) return null;

  const categoryMeta = MAP_CATEGORIES.find((c) => c.value === routeCategory) || { label: routeCategory };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this map permanently?")) return;
    try {
      await deleteMap(id);
      toast.success("Map deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed.");
    }
  };

  return (
    <AdminLayout title={`${categoryMeta.label} · Maps`} subtitle={`${maps.length} maps in ${categoryMeta.label}`} backHref="/admin/maps">
      {maps.length === 0 ? (
        <div className="card p-12 text-center">
          <Map className="mx-auto mb-3 text-[var(--color-primary)]" size={32} strokeWidth={1.6} />
          <div className="font-semibold text-[var(--color-ink)]">No maps in this category yet.</div>
          <Link href={`/admin/maps/${routeCategory}/new`} className="btn btn-primary mt-5">Add {categoryMeta.label}</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hairline-b bg-[var(--color-surface-alt)] px-5 py-3">
            <div className="text-[13px] font-semibold text-[var(--color-ink-2)]">{categoryMeta.label} ({maps.length})</div>
          </div>
          <div>
            {maps.map((item, index) => (
              <div key={item.id} className={`grid gap-4 px-5 py-4 md:grid-cols-[72px_1fr_auto] md:items-center ${index !== maps.length - 1 ? "hairline-b" : ""}`}>
                <div className="h-[72px] w-[72px] overflow-hidden rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                  {item.thumbnailUrl || item.imageUrl ? (
                    <img src={item.thumbnailUrl || item.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip chip-primary">{categoryLabel(item.category)}</span>
                    <span className={`chip ${item.status === "published" ? "chip-green" : "chip-amber"}`}>{item.status === "published" ? "Published" : "Draft"}</span>
                  </div>
                  <div className="mt-2 text-[15px] font-semibold text-[var(--color-ink)]">{item.title}</div>
                  <div className="mt-1 text-[12px] text-[var(--color-ink-muted)]">/{item.slug}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/maps/map/${item.id}/edit`} className="btn btn-ghost !px-3 !py-2 text-[13px]"><Edit3 size={14} /> Edit</Link>
                  <button type="button" onClick={() => handleDelete(item.id)} className="btn !px-3 !py-2 text-[13px]" style={{ background: "var(--color-accent-tint)", color: "var(--color-accent-hover)" }}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Link href={`/admin/maps/${routeCategory}/new`} className="btn btn-primary">Add {categoryMeta.label}</Link>
      </div>
    </AdminLayout>
  );
}
