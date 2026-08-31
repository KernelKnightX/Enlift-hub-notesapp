import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import AdminLayout from "@/layouts/AdminLayout";
import CategoryMapForm from "@/components/admin/CategoryMapForm";
import useAdminGate from "@/hooks/admin/useAdminGate";
import { getMapById } from "@/lib/firestore/maps";
import { getMapCategoryAdmin, getMapCategoryListPath } from "@/lib/mapCategoryFields";

export default function EditCategoryMapPage() {
  const router = useRouter();
  const { category, id } = router.query;
  const { user, loading, isAdmin } = useAdminGate();
  const [mapItem, setMapItem] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  const config = getMapCategoryAdmin(category);
  const listPath = getMapCategoryListPath(category);

  useEffect(() => {
    if (!isAdmin || !id || !category) return;
    let cancelled = false;

    (async () => {
      try {
        const found = await getMapById(id);
        if (!found) {
          toast.error("Map not found.");
          router.replace(listPath);
          return;
        }
        if (found.category !== category) {
          toast.error("This entry does not belong to this category.");
          router.replace(listPath);
          return;
        }
        if (!cancelled) setMapItem(found);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load map.");
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, category, isAdmin, router, listPath]);

  if (loading || mapLoading || !router.isReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]" />
      </div>
    );
  }

  if (!isAdmin || !mapItem || !config) return null;

  return (
    <AdminLayout
      title={`Edit ${config.label}`}
      subtitle={mapItem.title}
      backHref={listPath}
    >
      <CategoryMapForm category={category} initialMap={mapItem} user={user} />
    </AdminLayout>
  );
}
